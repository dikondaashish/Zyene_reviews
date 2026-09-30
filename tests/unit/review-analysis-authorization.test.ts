import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    createClient: vi.fn(), canManage: vi.fn(), limit: vi.fn(), analyze: vi.fn(),
    planAllows: vi.fn(),
}));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/auth/manage-business-integration", () => ({ canManageBusinessIntegration: mocks.canManage }));
vi.mock("@/lib/auth/rate-limit", () => ({ aiRateLimit: { limit: mocks.limit } }));
vi.mock("@/domains/ai/services/ai-analysis-service", () => ({ analyzeReview: mocks.analyze }));
vi.mock("@/services/stripe/plans", () => ({ planAllowsAiReviewFeatures: mocks.planAllows }));

import { handleReviewAnalysis } from "@/services/ai/review-analysis-api";

const reviewId = "11111111-1111-4111-8111-111111111111";
const businessId = "22222222-2222-4222-8222-222222222222";
const request = () => new Request("http://localhost/api/ai/analyze", {
    method: "POST", body: JSON.stringify({ reviewId }),
});

describe("on-demand review analysis authorization", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.createClient.mockResolvedValue({
            auth: { getUser: async () => ({ data: { user: { id: "user-a" } } }) },
            from: (table: string) => ({
                select: () => ({ eq: () => ({ maybeSingle: async () => ({
                    data: table === "reviews"
                        ? { id: reviewId, business_id: businessId, text: "Review" }
                        : { organizations: { plan: "starter", plan_status: "active" } },
                    error: null,
                }) }) }),
            }),
        });
        mocks.canManage.mockResolvedValue(true);
        mocks.planAllows.mockReturnValue(true);
        mocks.limit.mockResolvedValue({ success: true });
        mocks.analyze.mockResolvedValue({ sentiment: "positive" });
    });

    it("rejects a foreign tenant or viewer before model spend", async () => {
        mocks.canManage.mockResolvedValue(false);
        expect((await handleReviewAnalysis(request())).status).toBe(404);
        expect(mocks.canManage).toHaveBeenCalledWith(expect.anything(), "user-a", businessId);
        expect(mocks.limit).not.toHaveBeenCalled();
        expect(mocks.analyze).not.toHaveBeenCalled();
    });

    it("requires an entitled plan before model spend", async () => {
        mocks.planAllows.mockReturnValue(false);
        expect((await handleReviewAnalysis(request())).status).toBe(403);
        expect(mocks.analyze).not.toHaveBeenCalled();
    });

    it("fails closed when the user limiter is spent or unavailable", async () => {
        mocks.limit.mockResolvedValueOnce({ success: false });
        expect((await handleReviewAnalysis(request())).status).toBe(429);
        mocks.limit.mockRejectedValueOnce(new Error("Redis unavailable"));
        expect((await handleReviewAnalysis(request())).status).toBe(503);
        expect(mocks.analyze).not.toHaveBeenCalled();
    });

    it("analyzes an authorized review", async () => {
        expect((await handleReviewAnalysis(request())).status).toBe(200);
        expect(mocks.analyze).toHaveBeenCalledOnce();
    });
});
