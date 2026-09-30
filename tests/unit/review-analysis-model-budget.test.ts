import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ admin: vi.fn(), limit: vi.fn(), generate: vi.fn() }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/auth/rate-limit", () => ({ aiAnalysisBusinessRateLimit: { limit: mocks.limit } }));
vi.mock("@/domains/ai/adapters/vertex-adapter", () => ({ generateContentWithFallback: mocks.generate }));
vi.mock("@/services/stripe/plans", () => ({ planAllowsAiReviewFeatures: () => true }));

import { analyzeReview, categorizePrivateFeedback } from "@/domains/ai/services/ai-analysis-service";

describe("review analysis model budget", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.admin.mockReturnValue({ from: () => ({ select: () => ({ eq: () => ({
            maybeSingle: async () => ({ data: { organizations: { plan: "starter", plan_status: "active" } } }),
        }) }) }) });
    });

    it("does not spend on an unscoped review", async () => {
        expect(await analyzeReview({ id: "review-a", text: "Good" })).toBeNull();
        expect(mocks.generate).not.toHaveBeenCalled();
    });

    it("does not spend when the business budget is exhausted or Redis fails", async () => {
        mocks.limit.mockResolvedValueOnce({ success: false });
        expect(await analyzeReview({ id: "review-a", business_id: "business-a", text: "Good" })).toBeNull();
        mocks.limit.mockRejectedValueOnce(new Error("Redis unavailable"));
        expect(await analyzeReview({ id: "review-a", business_id: "business-a", text: "Good" })).toBeNull();
        expect(mocks.generate).not.toHaveBeenCalled();
    });

    it("also bounds public private-feedback categorization by the verified business", async () => {
        mocks.limit.mockResolvedValueOnce({ success: false });
        expect(await categorizePrivateFeedback("Feedback", "business-a")).toBe("Other");
        mocks.limit.mockRejectedValueOnce(new Error("Redis unavailable"));
        expect(await categorizePrivateFeedback("Feedback", "business-a")).toBe("Other");
        expect(mocks.generate).not.toHaveBeenCalled();
        expect(mocks.limit).toHaveBeenCalledWith("business-a");
    });
});
