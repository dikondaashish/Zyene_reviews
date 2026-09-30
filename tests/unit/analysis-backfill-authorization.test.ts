import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireUser: vi.fn(), canManage: vi.fn(), limit: vi.fn(), send: vi.fn(),
    planAllows: vi.fn(),
}));
vi.mock("@/app/api/_shared/auth", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/auth/manage-business-integration", () => ({ canManageBusinessIntegration: mocks.canManage }));
vi.mock("@/lib/auth/rate-limit", () => ({ aiAnalysisBackfillRateLimit: { limit: mocks.limit } }));
vi.mock("@/services/inngest/client", () => ({ inngest: { send: mocks.send } }));
vi.mock("@/services/stripe/plans", () => ({ planAllowsAiReviewFeatures: mocks.planAllows }));

import { handleSmartAnalyzeBackfill } from "@/services/smart/analyze-backfill-api";

const businessId = "22222222-2222-4222-8222-222222222222";
const request = (limit = 250) => new Request("http://localhost/api/smart/analyze/backfill", {
    method: "POST", body: JSON.stringify({ businessId, limit }),
});

describe("analysis backfill authorization", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireUser.mockResolvedValue({
            user: { id: "user-a" },
            supabase: { from: (table: string) => ({
                select: () => ({ eq: () => ({
                    maybeSingle: async () => ({ data: {
                        organizations: { plan: "starter", plan_status: "active" },
                    }, error: null }),
                    is: () => ({ not: () => ({ neq: () => ({ order: () => ({
                        limit: async () => ({ data: [{ id: "review-a" }], error: null }),
                    }) }) }) }),
                }) }),
            }) },
        });
        mocks.canManage.mockResolvedValue(true);
        mocks.planAllows.mockReturnValue(true);
        mocks.limit.mockResolvedValue({ success: true });
        mocks.send.mockResolvedValue(undefined);
    });

    it("denies a foreign business or viewer before enqueue", async () => {
        mocks.canManage.mockResolvedValue(false);
        expect((await handleSmartAnalyzeBackfill(request())).status).toBe(404);
        expect(mocks.canManage).toHaveBeenCalledWith(expect.anything(), "user-a", businessId);
        expect(mocks.send).not.toHaveBeenCalled();
    });

    it("rejects oversized backfills instead of silently accepting a costly request", async () => {
        expect((await handleSmartAnalyzeBackfill(request(1500))).status).toBe(400);
        expect(mocks.send).not.toHaveBeenCalled();
    });

    it("fails closed on exhausted or unavailable business budget", async () => {
        mocks.limit.mockResolvedValueOnce({ success: false });
        expect((await handleSmartAnalyzeBackfill(request())).status).toBe(429);
        mocks.limit.mockRejectedValueOnce(new Error("Redis unavailable"));
        expect((await handleSmartAnalyzeBackfill(request())).status).toBe(503);
        expect(mocks.send).not.toHaveBeenCalled();
    });
});
