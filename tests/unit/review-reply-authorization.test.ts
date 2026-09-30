import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn(), canManage: vi.fn(), platform: vi.fn() }));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/auth/manage-business-integration", () => ({
    canManageBusinessIntegration: mocks.canManage,
}));
vi.mock("@/services/google/business-profile", () => ({
    deleteReviewReply: vi.fn(), replyToReview: vi.fn(), listAccounts: vi.fn(),
}));
vi.mock("@/services/google/sync-service", () => ({ getValidGoogleToken: vi.fn() }));

import { fetchAuthorizedGoogleReview } from "@/services/reviews/reply-review-access";

describe("Google reply authorization", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        const query = {
            select: () => query,
            eq: () => query,
            single: async () => ({
                data: { id: "review-a", business_id: "business-a", platform: "google",
                    platform_id: "platform-a", external_id: "external-a" }, error: null,
            }),
            maybeSingle: mocks.platform,
        };
        mocks.createClient.mockResolvedValue({ from: () => query });
        mocks.platform.mockResolvedValue({ data: { id: "platform-a", business_id: "business-a" }, error: null });
    });

    it("denies a viewer before exposing the platform ID to reply logic", async () => {
        mocks.canManage.mockResolvedValue(false);
        const result = await fetchAuthorizedGoogleReview("review-a", "viewer-a");
        expect(result.ok).toBe(false);
        expect(mocks.canManage).toHaveBeenCalledWith(expect.anything(), "viewer-a", "business-a");
    });

    it("allows only an active manager of the review's business", async () => {
        mocks.canManage.mockResolvedValue(true);
        const result = await fetchAuthorizedGoogleReview("review-a", "manager-a");
        expect(result.ok).toBe(true);
    });

    it("rejects a review whose platform ID was changed to another tenant's integration", async () => {
        mocks.canManage.mockResolvedValue(true);
        mocks.platform.mockResolvedValue({ data: { id: "platform-b", business_id: "business-b" }, error: null });
        expect((await fetchAuthorizedGoogleReview("review-a", "manager-a")).ok).toBe(false);
    });
});
