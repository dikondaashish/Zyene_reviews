import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
    createClient: vi.fn(), canManage: vi.fn(), complete: vi.fn(),
}));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/auth/manage-business-integration", () => ({
    canManageBusinessIntegration: mocks.canManage,
}));
vi.mock("@/services/facebook/complete-oauth", () => ({ completeFacebookOAuth: mocks.complete }));
vi.mock("@/config/env", () => ({ getAppIntegrationsUrl: () => "https://app.example.com/integrations" }));

import { GET } from "@/app/api/integrations/facebook/callback/route";
import { createFacebookOAuthState, FACEBOOK_STATE_COOKIE } from "@/services/facebook/oauth-state";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const BUSINESS_ID = "22222222-2222-4222-8222-222222222222";

function callback(state: string, cookie?: string) {
    const request = new NextRequest(`https://app.example.com/api/integrations/facebook/callback?code=code&state=${state}`);
    if (cookie) request.cookies.set(FACEBOOK_STATE_COOKIE, cookie);
    return request;
}

describe("Facebook OAuth callback authorization", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.FACEBOOK_APP_SECRET = "test-only-facebook-secret";
        mocks.createClient.mockResolvedValue({
            auth: { getUser: async () => ({ data: { user: { id: USER_ID } } }) },
        });
        mocks.canManage.mockResolvedValue(true);
        mocks.complete.mockResolvedValue("selection-nonce");
    });

    it("rejects unsigned state before token exchange", async () => {
        const response = await GET(callback("forged"));
        expect(response.headers.get("location")).toContain("fb_error=invalid_state");
        expect(mocks.complete).not.toHaveBeenCalled();
    });

    it("rejects a state issued to a different user", async () => {
        const state = createFacebookOAuthState(
            "33333333-3333-4333-8333-333333333333", BUSINESS_ID, process.env.FACEBOOK_APP_SECRET!,
        );
        const response = await GET(callback(state.nonce, state.cookieValue));
        expect(response.headers.get("location")).toContain("fb_error=invalid_state");
        expect(mocks.complete).not.toHaveBeenCalled();
    });

    it("rejects a business the current user can no longer manage", async () => {
        const state = createFacebookOAuthState(USER_ID, BUSINESS_ID, process.env.FACEBOOK_APP_SECRET!);
        mocks.canManage.mockResolvedValue(false);
        const response = await GET(callback(state.nonce, state.cookieValue));
        expect(response.headers.get("location")).toContain("fb_error=invalid_state");
        expect(mocks.complete).not.toHaveBeenCalled();
    });

    it("sets only an opaque browser cookie after verified exchange", async () => {
        const state = createFacebookOAuthState(USER_ID, BUSINESS_ID, process.env.FACEBOOK_APP_SECRET!);
        const response = await GET(callback(state.nonce, state.cookieValue));
        expect(mocks.complete).toHaveBeenCalledWith("code", expect.any(String), USER_ID, BUSINESS_ID);
        expect(response.cookies.get("fb_connect_data")?.value).toBe("selection-nonce");
    });
});
