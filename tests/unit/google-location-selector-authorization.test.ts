import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ requireUser: vi.fn(), canManage: vi.fn(), token: vi.fn(), admin: vi.fn() }));
vi.mock("@/app/api/_shared/auth", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/auth/manage-business-integration", () => ({ canManageBusinessIntegration: mocks.canManage }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/db/redis", () => ({ redis: {} }));
vi.mock("@/services/google/sync-service", () => ({
    getValidGoogleToken: mocks.token, reattachOrphanedGoogleReviews: vi.fn(),
    refreshGoogleReviewRollupsFromDb: vi.fn(),
}));
vi.mock("@/services/google/business-profile", () => ({ listAccounts: vi.fn(), listLocations: vi.fn() }));
vi.mock("@/services/google/notifications", () => ({ registerNotificationsWithRetry: vi.fn() }));

import { getGoogleLocationSelector, postGoogleLocationSelector } from "@/services/google/location-selector-api";

const businessId = "22222222-2222-4222-8222-222222222222";
describe("Google location selection authorization", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireUser.mockResolvedValue({ supabase: {}, user: { id: "viewer-or-foreign-user" } });
        mocks.canManage.mockResolvedValue(false);
    });

    it("denies account enumeration to a viewer or foreign user before decrypting credentials", async () => {
        const response = await getGoogleLocationSelector(new NextRequest(
            `https://example.test/api/google/location-selector?businessId=${businessId}`,
        ));
        expect(response.status).toBe(403);
        expect(mocks.token).not.toHaveBeenCalled();
        expect(mocks.admin).not.toHaveBeenCalled();
    });

    it("denies a viewer or foreign user from switching the integration", async () => {
        const response = await postGoogleLocationSelector(new Request("https://example.test", {
            method: "POST", body: JSON.stringify({ businessId, accountName: "accounts/123", locationName: "locations/456" }),
        }));
        expect(response.status).toBe(403);
        expect(mocks.canManage).toHaveBeenCalledWith({}, "viewer-or-foreign-user", businessId);
        expect(mocks.token).not.toHaveBeenCalled();
        expect(mocks.admin).not.toHaveBeenCalled();
    });
});
