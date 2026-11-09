import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
    admin: vi.fn(),
    rows: [] as unknown[],
    eval: vi.fn(),
}));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/db/redis", () => ({ redis: { eval: mocks.eval } }));
import { checkLimit } from "@/lib/stripe/check-limits";
import { reserveChannelUsage } from "@/lib/stripe/reserve-channel-usage";
import { FREE_LIMITS } from "@/services/stripe/plans";

/** DB column defaults for a fresh organization row (001_initial_schema.sql). */
const DB_DEFAULT_CAPS = {
    max_businesses: 1,
    max_review_requests_per_month: 10,
    max_ai_replies_per_month: 0,
    max_email_requests_per_month: null,
    max_sms_requests_per_month: null,
    max_link_requests_per_month: null,
};

function queueOrg(org: Record<string, unknown>, usage = 0): void {
    mocks.rows = [
        { data: { ...DB_DEFAULT_CAPS, ...org }, error: null },
        { count: 1, error: null },
        { data: [{ id: "business-a" }], error: null },
        { count: usage, error: null },
    ];
}

describe("checkLimit for never-subscribed organizations", () => {
    it("free tier allows no SMS (precondition for these tests)", () => {
        expect(FREE_LIMITS.smsRequestsPerMonth).toBe(0);
    });

    beforeEach(() => {
        vi.clearAllMocks();
        mocks.admin.mockReturnValue({ from: () => {
            const query = {
                select: () => query, eq: () => query, gte: () => query, or: () => query,
                not: () => query, in: () => query, neq: () => query,
                single: async () => mocks.rows.shift(),
                then: (resolve: (row: unknown) => unknown) => Promise.resolve(mocks.rows.shift()).then(resolve),
            };
            return query;
        } });
    });

    it.each(["none", "free", null, "mystery_plan"])(
        "plan %s with plan_status active gets FREE_LIMITS for SMS",
        async plan => {
            queueOrg({ plan, plan_status: "active" });
            const result = await checkLimit("org-a", "sms_requests");
            expect(result).toMatchObject({ allowed: false, max: FREE_LIMITS.smsRequestsPerMonth, remaining: 0 });
        }
    );

    it("plan none with plan_status active gets FREE_LIMITS for email and businesses", async () => {
        queueOrg({ plan: "none", plan_status: "active", max_businesses: 5 });
        expect((await checkLimit("org-a", "email_requests")).max).toBe(FREE_LIMITS.emailRequestsPerMonth);
        queueOrg({ plan: "none", plan_status: "active", max_businesses: 5 });
        expect((await checkLimit("org-a", "businesses")).max).toBe(FREE_LIMITS.maxLocations);
    });

    it("plan none with plan_status active cannot reserve SMS usage", async () => {
        queueOrg({ plan: "none", plan_status: "active" });
        mocks.eval.mockResolvedValue(1);
        expect(await reserveChannelUsage("org-a", ["sms"], "claim-1")).toBe(false);
        expect(mocks.eval).not.toHaveBeenCalled();
    });

    it.each(["starter_monthly", "professional_yearly", "enterprise", "growth", "agency_pro"])(
        "paid plan %s with active status still uses its DB caps",
        async plan => {
            queueOrg({ plan, plan_status: "active", max_sms_requests_per_month: 250 }, 3);
            expect(await checkLimit("org-a", "sms_requests")).toMatchObject({ allowed: true, current: 3, max: 250 });
        }
    );

    it("paid plan with canceled status falls back to FREE_LIMITS", async () => {
        queueOrg({ plan: "starter_monthly", plan_status: "canceled", max_sms_requests_per_month: 250 });
        expect((await checkLimit("org-a", "sms_requests")).max).toBe(FREE_LIMITS.smsRequestsPerMonth);
    });
});
