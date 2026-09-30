import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    ipLimit: vi.fn(), businessLimit: vi.fn(), requestLimit: vi.fn(),
    context: vi.fn(), quota: vi.fn(), generate: vi.fn(), admin: vi.fn(),
    verify: vi.fn(),
}));

vi.mock("@/lib/review-requests/tracking-token", () => ({ verifyReviewTracking: mocks.verify }));

vi.mock("@/lib/auth/rate-limit", () => ({
    clientIpFrom: () => "test-ip",
    publicAiDraftIpRateLimit: { limit: mocks.ipLimit },
    publicAiDraftBusinessRateLimit: { limit: mocks.businessLimit },
    publicAiDraftRequestRateLimit: { limit: mocks.requestLimit },
}));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/services/review-flow/generate-review-prompt", () => ({
    loadRecentReviewsContext: mocks.context,
    buildReviewPrompt: () => "test prompt",
    buildStaffClause: () => "",
}));
vi.mock("@/services/review-flow/generate-review-quota", () => ({
    checkAiReviewDraftQuota: mocks.quota,
    PLAN_REQUIRED: { error: "Plan required" },
}));
vi.mock("@/domains/ai/adapters/vertex-adapter", () => ({
    generateContentWithFallback: mocks.generate,
}));

import { handleGenerateReviewFlow } from "@/services/review-flow/generate-review-api";

const REQUEST_ID = "11111111-1111-4111-8111-111111111111";
const BUSINESS_ID = "22222222-2222-4222-8222-222222222222";
const FOREIGN_ID = "33333333-3333-4333-8333-333333333333";

function draftRequest(input: Record<string, unknown> = {}) {
    return new Request("http://localhost/api/review-flow/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            reviewRequestId: REQUEST_ID, businessId: BUSINESS_ID,
            token: "signed-test-token",
            businessName: "Example", businessCategory: "Cafe", rating: 5,
            selectedTags: ["Service"], ...input,
        }),
    });
}

describe("public AI draft security", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.ipLimit.mockResolvedValue({ success: true });
        mocks.businessLimit.mockResolvedValue({ success: true });
        mocks.requestLimit.mockResolvedValue({ success: true });
        mocks.context.mockResolvedValue({ resolvedBusinessId: BUSINESS_ID, recentReviewsContext: "" });
        mocks.quota.mockResolvedValue(null);
        mocks.generate.mockResolvedValue("A complete review for Example.");
        mocks.admin.mockReturnValue({});
        mocks.verify.mockReturnValue(true);
    });

    it("rejects a forged or nonexistent request ID before model spend", async () => {
        mocks.context.mockResolvedValue({ resolvedBusinessId: null, recentReviewsContext: "" });
        const response = await handleGenerateReviewFlow(draftRequest());
        expect(response.status).toBe(403);
        expect(mocks.generate).not.toHaveBeenCalled();
    });

    it("rejects a leaked request ID without its signature before privileged reads", async () => {
        mocks.verify.mockReturnValue(false);
        expect((await handleGenerateReviewFlow(draftRequest())).status).toBe(403);
        expect(mocks.verify).toHaveBeenCalledWith(REQUEST_ID, BUSINESS_ID, "signed-test-token");
        expect(mocks.admin).not.toHaveBeenCalled();
        expect(mocks.context).not.toHaveBeenCalled();
        expect(mocks.generate).not.toHaveBeenCalled();
    });

    it("rejects a client business ID from another tenant", async () => {
        const response = await handleGenerateReviewFlow(draftRequest({ businessId: FOREIGN_ID }));
        expect(response.status).toBe(403);
        expect(mocks.businessLimit).not.toHaveBeenCalled();
        expect(mocks.generate).not.toHaveBeenCalled();
    });

    it("fails closed if rate-limit storage is unavailable", async () => {
        mocks.ipLimit.mockRejectedValue(new Error("Redis unavailable"));
        const response = await handleGenerateReviewFlow(draftRequest());
        expect(response.status).toBe(503);
        expect(mocks.admin).not.toHaveBeenCalled();
        expect(mocks.generate).not.toHaveBeenCalled();
    });

    it("enforces business-level limits even when the caller has a fresh request ID", async () => {
        mocks.businessLimit.mockResolvedValue({ success: false });
        const response = await handleGenerateReviewFlow(draftRequest());
        expect(response.status).toBe(429);
        expect(mocks.businessLimit).toHaveBeenCalledWith(BUSINESS_ID);
        expect(mocks.generate).not.toHaveBeenCalled();
    });

    it("requires a review request ID even when a paid business ID is supplied", async () => {
        const response = await handleGenerateReviewFlow(draftRequest({ reviewRequestId: undefined }));
        expect(response.status).toBe(400);
        expect(mocks.generate).not.toHaveBeenCalled();
    });
});
