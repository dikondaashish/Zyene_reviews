import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    createClient: vi.fn(), cookies: vi.fn(), read: vi.fn(), canManage: vi.fn(),
}));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/services/facebook/connect-session", () => ({
    FB_CONNECT_COOKIE: "fb_connect_data", readFacebookConnectData: mocks.read,
}));
vi.mock("@/lib/auth/manage-business-integration", () => ({
    canManageBusinessIntegration: mocks.canManage,
}));

import { GET } from "@/app/api/integrations/facebook/pages/route";

describe("Facebook page selection token boundary", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.createClient.mockResolvedValue({
            auth: { getUser: async () => ({ data: { user: { id: "user-a" } } }) },
        });
        mocks.cookies.mockResolvedValue({ get: () => ({ value: "opaque-nonce" }) });
        mocks.read.mockResolvedValue({
            userId: "user-a", businessId: "business-a",
            pages: [{ pageId: "page-a", pageName: "Example", pageAccessToken: "test-secret-token" }],
        });
        mocks.canManage.mockResolvedValue(true);
    });

    it("does not send OAuth tokens to the browser", async () => {
        const response = await GET();
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            businessId: "business-a", pages: [{ pageId: "page-a", pageName: "Example" }],
        });
    });

    it("rejects another user or tenant even with the opaque cookie", async () => {
        mocks.read.mockResolvedValueOnce({ userId: "other-user", businessId: "business-a", pages: [] });
        expect((await GET()).status).toBe(403);
        expect(mocks.canManage).not.toHaveBeenCalled();
        mocks.canManage.mockResolvedValue(false);
        expect((await GET()).status).toBe(403);
    });
});
