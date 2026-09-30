import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ admin: vi.fn(), channel: vi.fn(), status: vi.fn(), rows: [] as unknown[] }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
import { checkLimit } from "@/lib/stripe/check-limits";

describe("channel quota database boundaries", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.rows = [
            { data: { plan: "starter", plan_status: "active", max_businesses: 1, max_sms_requests_per_month: 10, max_email_requests_per_month: 10 }, error: null },
            { count: 1, error: null }, { data: [{ id: "business-a" }], error: null }, { count: 4, error: null },
        ];
        mocks.admin.mockReturnValue({ from: () => {
            const query = {
                select: () => query, eq: () => query, gte: () => query, or: () => query, not: () => query,
                in: mocks.channel.mockImplementation(() => query), neq: mocks.status.mockImplementation(() => query),
                single: async () => mocks.rows.shift(),
                then: (resolve: (row: unknown) => unknown) => Promise.resolve(mocks.rows.shift()).then(resolve),
            };
            return query;
        } });
    });
    it.each(["sms", "email"] as const)("counts both-channel sends toward the %s allowance", async channel => {
        expect(await checkLimit("org-a", `${channel}_requests`)).toMatchObject({ allowed: true, current: 4, remaining: 6 });
        expect(mocks.channel).toHaveBeenCalledWith("channel", [channel, "both"]);
        expect(mocks.status).toHaveBeenCalledWith("status", "skipped");
    });
    it.each([1, 2, 3])("fails closed on lookup/count failure at step %i", async index => {
        mocks.rows[index] = { data: null, count: null, error: { message: "Synthetic outage" } };
        expect(await checkLimit("org-a", "sms_requests")).toMatchObject({ allowed: false, max: 0 });
    });
    it("does not turn a missing count into zero usage", async () => {
        mocks.rows[3] = { count: null, error: null };
        expect((await checkLimit("org-a", "sms_requests")).allowed).toBe(false);
    });
});
