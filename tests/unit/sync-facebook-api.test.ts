import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireUser: vi.fn(),
    getFacebookPlatformForUser: vi.fn(),
    syncFacebookReviewsForPlatform: vi.fn(),
    syncRateLimit: { limit: vi.fn() },
    canManage: vi.fn(),
}));

vi.mock("@/lib/auth/manage-business-integration", () => ({
    canManageBusinessIntegration: (...args: unknown[]) => mocks.canManage(...args),
}));

vi.mock("@/app/api/_shared/auth", () => ({
    requireUser: () => mocks.requireUser(),
}));

vi.mock("@/services/facebook/sync-facebook-platform", () => ({
    getFacebookPlatformForUser: (...args: unknown[]) => mocks.getFacebookPlatformForUser(...args),
}));

vi.mock("@/services/facebook/sync-service", () => ({
    syncFacebookReviewsForPlatform: (...args: unknown[]) => mocks.syncFacebookReviewsForPlatform(...args),
}));

vi.mock("@/lib/auth/rate-limit", () => ({
    syncRateLimit: mocks.syncRateLimit,
}));

import { handleFacebookSyncPost } from "@/services/facebook/sync-facebook-api";

describe("handleFacebookSyncPost", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireUser.mockResolvedValue({ supabase: {}, user: { id: "user-1" } });
        mocks.syncRateLimit.limit.mockResolvedValue({ success: true });
        mocks.canManage.mockResolvedValue(true);
        mocks.getFacebookPlatformForUser.mockResolvedValue({
            businessId: "22222222-2222-4222-8222-222222222222",
            platform: { id: "platform-1", platform: "facebook", sync_status: "active", last_synced_at: null },
        });
        mocks.syncFacebookReviewsForPlatform.mockResolvedValue({
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
                body: JSON.stringify({ businessId: "22222222-2222-4222-8222-222222222222" }),
            }),
        );
        const body = await response.json();

        expect(mocks.getFacebookPlatformForUser).toHaveBeenCalledWith({}, "22222222-2222-4222-8222-222222222222");
        expect(mocks.syncFacebookReviewsForPlatform).toHaveBeenCalledWith("platform-1");
        expect(response.status).toBe(200);
        expect(body).toEqual({
            success: true,
            data: { success: true, total: 3, analyzed: 3, alerts: 0 },
        });
    });

    it("refuses a manual sync from someone who cannot manage the business (viewer)", async () => {
        mocks.canManage.mockResolvedValue(false);
        const response = await handleFacebookSyncPost(
            new Request("http://localhost/api/sync/facebook", {
                method: "POST",
                body: JSON.stringify({ businessId: "22222222-2222-4222-8222-222222222222" }),
            }),
        );
        expect(response.status).toBe(404);
        expect(mocks.syncFacebookReviewsForPlatform).not.toHaveBeenCalled();
    });

    it("rejects a malformed businessId before any lookup", async () => {
        const response = await handleFacebookSyncPost(
            new Request("http://localhost/api/sync/facebook", { method: "POST", body: JSON.stringify({ businessId: "nope" }) }),
        );
        expect(response.status).toBe(400);
        expect(mocks.getFacebookPlatformForUser).not.toHaveBeenCalled();
    });
});
