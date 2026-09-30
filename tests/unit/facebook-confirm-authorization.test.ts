import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    createClient: vi.fn(), createAdminClient: vi.fn(), cookies: vi.fn(),
    consume: vi.fn(), canManage: vi.fn(), getPageDetails: vi.fn(),
}));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/services/facebook/connect-session", () => ({
    FB_CONNECT_COOKIE: "fb_connect_data", consumeFacebookConnectData: mocks.consume,
}));
vi.mock("@/lib/auth/manage-business-integration", () => ({
    canManageBusinessIntegration: mocks.canManage,
}));
vi.mock("@/services/facebook/adapter", () => ({ getPageDetails: mocks.getPageDetails }));
vi.mock("@/services/facebook/sync-service", () => ({ syncFacebookReviewsForPlatform: vi.fn() }));

import { handleFacebookConfirm } from "@/services/facebook/confirm-api";

const request = () => new Request("https://app.example.com/api/integrations/facebook/confirm", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pageId: "page-a" }),
});

describe("Facebook confirmation authorization", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.createClient.mockResolvedValue({
            auth: { getUser: async () => ({ data: { user: { id: "user-a" } } }) },
        });
        mocks.cookies.mockResolvedValue({ get: () => ({ value: "opaque-nonce" }) });
        mocks.consume.mockResolvedValue({
            userId: "user-a", businessId: "business-a", tokenExpiresIn: 300,
            pages: [{ pageId: "page-a", pageName: "Example", pageAccessToken: "test-token" }],
        });
    });

    it("rejects another user's session before privileged work", async () => {
        mocks.consume.mockResolvedValueOnce({
            userId: "other-user", businessId: "business-a", pages: [],
        });
        expect((await handleFacebookConfirm(request())).status).toBe(403);
        expect(mocks.createAdminClient).not.toHaveBeenCalled();
        expect(mocks.getPageDetails).not.toHaveBeenCalled();
    });

    it("rejects a foreign business before privileged work", async () => {
        mocks.canManage.mockResolvedValue(false);
        expect((await handleFacebookConfirm(request())).status).toBe(403);
        expect(mocks.canManage).toHaveBeenCalledWith(expect.anything(), "user-a", "business-a");
        expect(mocks.createAdminClient).not.toHaveBeenCalled();
        expect(mocks.getPageDetails).not.toHaveBeenCalled();
    });
});
