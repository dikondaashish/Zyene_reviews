import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    admin: vi.fn(), send: vi.fn(), inngestSend: vi.fn(), access: vi.fn(),
    loadUndigested: vi.fn(), markDigestSent: vi.fn(), deliver: vi.fn(),
}));
vi.mock("@/services/inngest/client", () => ({
    inngest: { send: mocks.inngestSend, createFunction: (_c: unknown, _t: unknown, handler: unknown) => ({ handler }) },
}));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/cron/run-cron-job", () => ({
    runCronJob: (_r: Request, _o: unknown, fn: (ctx: { occurrenceKey: string }) => Promise<Response>) => fn({ occurrenceKey: "2026-11-08" }),
}));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() } }));
vi.mock("@/lib/features/aeo-surfaces", () => ({ isLiveAlertingEnabled: () => true }));
vi.mock("@/services/aeo/alerting/alert-store", () => ({
    SupabaseAlertStore: class { loadUndigested = mocks.loadUndigested; markDigestSent = mocks.markDigestSent; },
}));
vi.mock("@/services/resend/templates/aeo-alert-digest-email", () => ({ aeoAlertDigestEmail: () => "<p>digest</p>" }));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: mocks.send }));
vi.mock("@/services/aeo/alerting/deliver-alert-channel", () => ({ deliverAlertChannel: mocks.deliver }));
vi.mock("@/lib/db/supabase/verify-business-access-strict", () => ({ userCanAccessBusinessOrThrow: mocks.access }));

import { GET } from "@/app/api/cron/aeo-alert-digest/route";
import { aeoAlertDigestWorker } from "@/services/inngest/aeo/aeo-alert-digest-worker";

type Row = Record<string, unknown>;
type Filter = { col: string; op: string; val: unknown };

/** Chainable query that honours eq/in filters and range() paging over in-memory rows. */
function makeAdmin(tables: Record<string, Row[]>, calls: { table: string; filters: Filter[]; range?: [number, number] }[]) {
    return {
        from(table: string) {
            const call: { table: string; filters: Filter[]; range?: [number, number] } = { table, filters: [] };
            calls.push(call);
            const rows = () => (tables[table] ?? []).filter((r) => call.filters.every((f) =>
                f.op === "eq" ? r[f.col] === f.val : f.op === "in" ? (f.val as unknown[]).includes(r[f.col]) : (r[f.col] ?? null) === f.val));
            const result = () => {
                const all = rows();
                return { data: call.range ? all.slice(call.range[0], call.range[1] + 1) : all, error: null };
            };
            const q = {
                select: () => q, order: () => q, update: () => q, or: () => q,
                eq: (col: string, val: unknown) => { call.filters.push({ col, op: "eq", val }); return q; },
                in: (col: string, val: unknown) => { call.filters.push({ col, op: "in", val }); return q; },
                is: (col: string, val: unknown) => { call.filters.push({ col, op: "is", val }); return q; },
                range: (a: number, b: number) => { call.range = [a, b]; return q; },
                single: async () => ({ data: rows()[0] ?? null, error: null }),
                then: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) => Promise.resolve(result()).then(resolve, reject),
            };
            return q;
        },
    };
}

describe("aeo-alert-digest cron fan-out", () => {
    beforeEach(() => vi.resetAllMocks());

    it("pages past the 1000-row PostgREST cap so later businesses are dispatched", async () => {
        const alerts: Row[] = Array.from({ length: 2500 }, (_, i) => ({
            id: `a${String(i).padStart(5, "0")}`, business_id: i < 1000 ? "biz-1" : i < 2000 ? "biz-2" : "biz-3",
            digest_sent_at: null, muted_at: null,
        }));
        const calls: { table: string; filters: Filter[]; range?: [number, number] }[] = [];
        mocks.admin.mockReturnValue(makeAdmin({ aeo_alerts: alerts }, calls));
        const res = await GET(new Request("https://x.test/api/cron/aeo-alert-digest"));
        expect(await res.json()).toEqual({ success: true, dispatched: 3 });
        const events = mocks.inngestSend.mock.calls[0][0] as { data: { businessId: string } }[];
        expect(events.map((e) => e.data.businessId).sort()).toEqual(["biz-1", "biz-2", "biz-3"]);
        expect(calls.every((c) => c.range)).toBe(true);
    });
});

type StepCtx = { event: { id: string; data: { businessId: string } }; step: { run: <T>(n: string, f: () => Promise<T>) => Promise<T> } };
const run = (aeoAlertDigestWorker as unknown as { handler: (c: StepCtx) => Promise<unknown> }).handler;

describe("aeo-alert-digest worker", () => {
    const tables = (): Record<string, Row[]> => ({
        businesses: [{ id: "biz-1", name: "Biz", organization_id: "org-1" }],
        organization_members: [
            { organization_id: "org-1", user_id: "u-active", status: "active" },
            { organization_id: "org-1", user_id: "u-removed", status: "removed" },
            { organization_id: "org-1", user_id: "u-other-location", status: "active" },
        ],
        notification_preferences: [
            { business_id: "biz-1", user_id: "u-active", users: { email: "active@example.test" } },
            { business_id: "biz-1", user_id: "u-removed", users: { email: "removed@example.test" } },
            { business_id: "biz-1", user_id: "u-other-location", users: { email: "other@example.test" } },
        ],
        aeo_alert_channels: [],
    });
    /** Records each step's outcome; a rejected step stands in for "retries exhausted". */
    let stepOutcomes: Record<string, unknown>;
    const ctx = (): StepCtx => ({ event: { id: "evt-1", data: { businessId: "biz-1" } }, step: { run: async (n, f) => {
        try { const v = await f(); stepOutcomes[n] = v; return v; } catch (e) { stepOutcomes[n] = e; throw e; }
    } } });

    beforeEach(() => {
        vi.resetAllMocks();
        stepOutcomes = {};
        mocks.admin.mockReturnValue(makeAdmin(tables(), []));
        mocks.loadUndigested.mockResolvedValue([{ id: "al-1", severity: "high", title: "t", detail: "d", alert_type: "rank_drop", prompt_id: null, engine_id: null }]);
        mocks.access.mockImplementation(async (_a: unknown, userId: string) => userId !== "u-other-location");
        mocks.send.mockResolvedValue({ sent: true, id: "m1" });
    });

    it("emails only active members who can access the business", async () => {
        await run(ctx());
        expect(mocks.send.mock.calls.map((c) => (c[0] as { to: string }).to)).toEqual(["active@example.test"]);
        expect(mocks.markDigestSent).toHaveBeenCalledWith(["al-1"]);
    });

    it("re-checks access at send time and skips a member removed after the build step", async () => {
        mocks.access.mockResolvedValueOnce(true).mockResolvedValueOnce(true).mockResolvedValue(false);
        await run(ctx());
        expect(mocks.send).not.toHaveBeenCalled();
    });

    it("fails the send step on a failed send so Inngest retries it, then moves on after retries", async () => {
        mocks.send.mockResolvedValue({ sent: false, error: "rate limited" });
        await run(ctx());
        const outcome = stepOutcomes["send-digest-u-active"];
        expect(outcome).toBeInstanceOf(Error);
        expect((outcome as Error).message).toMatch(/rate limited/);
        expect((outcome as Error).name).not.toBe("NonRetriableError");
        // A permanently failing recipient must not leave the batch undigested
        // (the next daily cron would re-email everyone else, forever).
        expect(mocks.markDigestSent).toHaveBeenCalledWith(["al-1"]);
    });

    it("marks a missing Resend key as non-retriable", async () => {
        mocks.send.mockResolvedValue({ sent: false, error: "RESEND_API_KEY is not set on the server" });
        await run(ctx());
        expect((stepOutcomes["send-digest-u-active"] as Error).name).toBe("NonRetriableError");
    });

    it("retries (does not skip) when the send-time access check hits a DB error", async () => {
        mocks.access.mockResolvedValueOnce(true).mockResolvedValueOnce(false).mockRejectedValue(new Error("503"));
        await run(ctx());
        expect(stepOutcomes["send-digest-u-active"]).toBeInstanceOf(Error);
        expect(mocks.send).not.toHaveBeenCalled();
    });

    it("fails build-digest on a DB error instead of treating it as no recipients", async () => {
        mocks.access.mockRejectedValue(new Error("timeout"));
        await expect(run(ctx())).rejects.toThrow(/timeout/);
        expect(mocks.markDigestSent).not.toHaveBeenCalled();
    });

    it("a permanently broken webhook does not block marking the digest sent", async () => {
        const t = tables();
        t.aeo_alert_channels = [{ id: "ch-1", organization_id: "org-1", enabled: true, channel_type: "webhook", endpoint_ciphertext: "x", signing_secret_ciphertext: null }];
        mocks.admin.mockReturnValue(makeAdmin(t, []));
        mocks.deliver.mockRejectedValue(new Error("HTTP 404"));
        await run(ctx());
        expect(stepOutcomes["deliver-channel-ch-1"]).toBeInstanceOf(Error);
        expect(mocks.send).toHaveBeenCalledTimes(1);
        expect(mocks.markDigestSent).toHaveBeenCalledWith(["al-1"]);
    });
});
