import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ admin: vi.fn(), send: vi.fn() }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/services/inngest/client", () => ({ inngest: { send: mocks.send } }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() } }));
vi.mock("@/lib/cron/run-cron-job", () => ({
    runCronJob: (_req: Request, _opts: unknown, handler: (ctx: { occurrenceKey: string }) => Promise<Response>) =>
        handler({ occurrenceKey: "2026-11-09" }),
}));

import { GET } from "@/app/api/cron/aeo-report-scheduler/route";

type Schedule = { id: string; enabled: boolean; business_id: string | null; next_send_at: string };

/** PostgREST-like: applies the eq/not/lte filters, honours .range(), caps pages at 1000 rows. */
function adminWith(rows: Schedule[]) {
    const calls: string[] = [];
    const client = {
        from: () => {
            const filters: Array<(r: Schedule) => boolean> = [];
            let range: [number, number] = [0, 999];
            const query = {
                select: () => query,
                eq: (col: keyof Schedule, val: unknown) => { calls.push(`eq:${col}`); filters.push((r) => r[col] === val); return query; },
                not: (col: keyof Schedule, op: string, val: unknown) => {
                    calls.push(`not:${col}:${op}`);
                    filters.push((r) => (r[col] ?? null) !== val);
                    return query;
                },
                lte: (col: keyof Schedule, val: string) => { filters.push((r) => String(r[col]) <= val); return query; },
                order: () => query,
                limit: () => query,
                range: (from: number, to: number) => { range = [from, to]; return query; },
                then: (resolve: (v: unknown) => unknown) => {
                    const matched = rows.filter((r) => filters.every((f) => f(r)))
                        .sort((a, b) => a.next_send_at.localeCompare(b.next_send_at) || a.id.localeCompare(b.id));
                    const [from, to] = range;
                    return Promise.resolve({ data: matched.slice(from, Math.min(to, from + 999) + 1), error: null }).then(resolve);
                },
            };
            return query;
        },
    };
    return { client, calls };
}

const past = (i: number) => new Date(Date.UTC(2026, 0, 1) + i * 1000).toISOString();
const call = () => GET(new Request("https://app.example.test/api/cron/aeo-report-scheduler"));

beforeEach(() => {
    vi.resetAllMocks();
    mocks.send.mockResolvedValue(undefined);
});

describe("aeo report scheduler", () => {
    it("queues every due schedule even when more than 100 older ones are stuck ahead of it", async () => {
        const stuck = Array.from({ length: 150 }, (_, i) => ({ id: `stuck-${String(i).padStart(4, "0")}`, enabled: true, business_id: "b", next_send_at: past(i) }));
        const fresh = { id: "fresh", enabled: true, business_id: "b", next_send_at: past(5000) };
        const { client } = adminWith([...stuck, fresh]);
        mocks.admin.mockReturnValue(client);
        const res = await call();
        expect(await res.json()).toEqual({ queued: 151 });
        const ids = mocks.send.mock.calls.flatMap((c) => (c[0] as Array<{ data: { scheduleId: string } }>).map((e) => e.data.scheduleId));
        expect(ids).toContain("fresh");
    });

    it("pages past the 1000-row cap and chunks event sends", async () => {
        const rows = Array.from({ length: 2300 }, (_, i) => ({ id: `s-${String(i).padStart(5, "0")}`, enabled: true, business_id: "b", next_send_at: past(i) }));
        mocks.admin.mockReturnValue(adminWith(rows).client);
        const res = await call();
        expect(await res.json()).toEqual({ queued: 2300 });
        const events = mocks.send.mock.calls.flatMap((c) => c[0] as Array<{ id: string }>);
        expect(new Set(events.map((e) => e.id)).size).toBe(2300);
        expect(events[0].id).toBe("cron:aeo-report-scheduler:2026-11-09:s-00000");
        expect(mocks.send.mock.calls.every((c) => (c[0] as unknown[]).length <= 200)).toBe(true);
    });

    it("never queues org-only or disabled schedules that the worker cannot process", async () => {
        const { client, calls } = adminWith([
            { id: "org-only", enabled: true, business_id: null, next_send_at: past(1) },
            { id: "disabled", enabled: false, business_id: "b", next_send_at: past(2) },
            { id: "ok", enabled: true, business_id: "b", next_send_at: past(3) },
            { id: "future", enabled: true, business_id: "b", next_send_at: "2999-01-01T00:00:00.000Z" },
        ]);
        mocks.admin.mockReturnValue(client);
        const res = await call();
        expect(await res.json()).toEqual({ queued: 1 });
        expect(calls).toContain("not:business_id:is");
        expect(mocks.send.mock.calls[0][0]).toEqual([
            { id: "cron:aeo-report-scheduler:2026-11-09:ok", name: "aeo/report.requested", data: { scheduleId: "ok" } },
        ]);
    });
});
