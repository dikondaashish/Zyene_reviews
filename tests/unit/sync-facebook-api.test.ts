import { beforeEach, describe, expect, it, vi } from "vitest";

import { handleFacebookSyncPost } from "@/services/facebook/sync-facebook-api";

const mockRequireUser = vi.fn();
const mockGetFacebookPlatformForUser = vi.fn();
const mockSyncFacebookReviewsForPlatform = vi.fn();
const mockSyncRateLimit = { limit: vi.fn() };

vi.mock("@/app/api/_shared/auth", () => ({
    requireUser: () => mockRequireUser(),
}));

vi.mock("@/services/facebook/sync-facebook-platform", () => ({
    getFacebookPlatformForUser: (...args: unknown[]) => mockGetFacebookPlatformForUser(...args),
}));

vi.mock("@/services/facebook/sync-service", () => ({
    syncFacebookReviewsForPlatform: (...args: unknown[]) => mockSyncFacebookReviewsForPlatform(...args),
}));

vi.mock("@/lib/auth/rate-limit", () => ({
    syncRateLimit: mockSyncRateLimit,
}));

describe("handleFacebookSyncPost", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRequireUser.mockResolvedValue({ supabase: {}, user: { id: "user-1" } });
        mockSyncRateLimit.limit.mockResolvedValue({ success: true });
        mockGetFacebookPlatformForUser.mockResolvedValue({
            businessId: "business-1",
            platform: { id: "platform-1", platform: "facebook", sync_status: "active", last_synced_at: null },
        });
        mockSyncFacebookReviewsForPlatform.mockResolvedValue({
            success: true,
            total: 3,
            analyzed: 3,
            alerts: 0,
        });
    });

    it("syncs the facebook platform for the requested business", async () => {
        const response = await handleFacebookSyncPost(
            new Request("http://localhost/api/sync/facebook", {
                method: "POST",
                body: JSON.stringify({ businessId: "business-1" }),
            }),
        );
        const body = await response.json();

        expect(mockGetFacebookPlatformForUser).toHaveBeenCalledWith({}, "business-1");
        expect(mockSyncFacebookReviewsForPlatform).toHaveBeenCalledWith("platform-1");
        expect(response.status).toBe(200);
        expect(body).toEqual({
            success: true,
            data: { success: true, total: 3, analyzed: 3, alerts: 0 },
        });
    });
});
