import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ admin: vi.fn(), send: vi.fn(), heartbeat: vi.fn() }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/services/inngest/client", () => ({ inngest: { send: mocks.send } }));
vi.mock("@/lib/monitoring/weekly-digest-heartbeat", () => ({ pingWeeklyDigestHeartbeat: mocks.heartbeat }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() } }));
vi.mock("@/lib/cron/run-cron-job", () => ({
    runCronJob: (_req: Request, _opts: unknown, handler: (ctx: { occurrenceKey: string }) => Promise<Response>) =>
        handler({ occurrenceKey: "2026-W45" }),
}));

import { GET } from "@/app/api/cron/weekly-digest/route";

type Review = { id: string; business_id: string; created_at: string };

/** PostgREST-like: never returns more than 1000 rows, honours .range(). */
function adminWith(reviews: Review[], failOnPage?: number) {
    const ranges: Array<[number, number]> = [];
    const client = {
        from: () => {
            let range: [number, number] | null = null;
            const query = {
                select: () => query, gte: () => query, lte: () => query, order: () => query,
                range: (from: number, to: number) => { range = [from, to]; ranges.push(range); return query; },
                then: (resolve: (v: unknown) => unknown) => {
                    const [from, to] = range ?? [0, 999];
                    if (failOnPage !== undefined && from / 1000 === failOnPage) {
                        return Promise.resolve({ data: null, error: { message: "boom" } }).then(resolve);
                    }
                    const end = Math.min(to, from + 999);
                    return Promise.resolve({ data: reviews.slice(from, end + 1), error: null }).then(resolve);
                },
            };
            return query;
        },
    };
    return { client, ranges };
}

function reviewsFor(count: number): Review[] {
    // One business per review, so a truncated read loses businesses.
    return Array.from({ length: count }, (_, i) => ({
        id: `r-${i}`, business_id: `biz-${i}`, created_at: new Date(Date.now() - i * 1000).toISOString(),
    }));
}

const call = () => GET(new Request("https://app.example.test/api/cron/weekly-digest"));

beforeEach(() => {
    vi.resetAllMocks();
    mocks.send.mockResolvedValue({ ids: [] });
    mocks.heartbeat.mockResolvedValue(undefined);
});

describe("weekly digest fan-out", () => {
    it("dispatches every business when the week has more than 1000 reviews", async () => {
        const { client, ranges } = adminWith(reviewsFor(2500));
        mocks.admin.mockReturnValue(client);
        const res = await call();
        const body = await res.json();
        expect(body.dispatched).toBe(2500);
        expect(ranges).toEqual([[0, 999], [1000, 1999], [2000, 2999]]);
        const events = mocks.send.mock.calls.flatMap((c) => c[0] as Array<{ id: string; data: { businessId: string } }>);
        expect(new Set(events.map((e) => e.data.businessId)).size).toBe(2500);
        expect(events).toContainEqual(expect.objectContaining({ id: "cron:weekly-digest:2026-W45:biz-2499" }));
        for (const c of mocks.send.mock.calls) expect((c[0] as unknown[]).length).toBeLessThanOrEqual(500);
        expect(mocks.heartbeat).toHaveBeenCalledWith(true);
    });

    it("de-duplicates businesses across pages", async () => {
        const reviews = reviewsFor(1500).map((r, i) => ({ ...r, business_id: `biz-${i % 3}` }));
        mocks.admin.mockReturnValue(adminWith(reviews).client);
        const body = await (await call()).json();
        expect(body.dispatched).toBe(3);
    });

    it("reports failure instead of a partial fan-out when a later page errors", async () => {
        mocks.admin.mockReturnValue(adminWith(reviewsFor(2500), 1).client);
        const res = await call();
        expect(res.status).toBe(500);
        expect(mocks.send).not.toHaveBeenCalled();
        expect(mocks.heartbeat).toHaveBeenCalledWith(false);
    });

    it("succeeds quietly with no reviews", async () => {
        mocks.admin.mockReturnValue(adminWith([]).client);
        const body = await (await call()).json();
        expect(body.message).toMatch(/No new reviews/);
        expect(mocks.send).not.toHaveBeenCalled();
        expect(mocks.heartbeat).toHaveBeenCalledWith(true);
    });
});
