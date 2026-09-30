import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const mocks = vi.hoisted(() => ({
    createClient: vi.fn(),
    createAdminClient: vi.fn(),
    runOAuthAddBusinessFlow: vi.fn(),
    resolveOAuthInviteParam: vi.fn(),
    runOAuthNewUserSignup: vi.fn(),
    runOAuthExistingUserLogin: vi.fn(),
    consumeAddBusinessOAuth: vi.fn(),
    canAddBusinessToOrganization: vi.fn(),
    getUser: vi.fn(),
    exchangeCodeForSession: vi.fn(),
}));

vi.mock("@/lib/db/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock("@/services/auth/oauth-callback-add-business", () => ({
    runOAuthAddBusinessFlow: mocks.runOAuthAddBusinessFlow,
}));
vi.mock("@/services/auth/oauth-invite", () => ({
    resolveOAuthInviteParam: mocks.resolveOAuthInviteParam,
}));
vi.mock("@/services/auth/oauth-callback-new-user", () => ({
    runOAuthNewUserSignup: mocks.runOAuthNewUserSignup,
}));
vi.mock("@/services/auth/oauth-callback-existing-user", () => ({
    runOAuthExistingUserLogin: mocks.runOAuthExistingUserLogin,
}));
vi.mock("@/services/auth/add-business-oauth-cookie", () => ({
    consumeAddBusinessOAuth: mocks.consumeAddBusinessOAuth,
}));
vi.mock("@/services/auth/add-business-authorization", () => ({
    canAddBusinessToOrganization: mocks.canAddBusinessToOrganization,
}));

import { handleOAuthCallback } from "@/services/auth/oauth-callback";

describe("add-business OAuth callback authorization", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getUser.mockResolvedValue({ data: { user: { id: "original-user" } } });
        mocks.exchangeCodeForSession.mockResolvedValue({
            data: { user: { id: "google-user" }, session: {} },
            error: null,
        });
        mocks.createClient.mockResolvedValue({
            auth: {
                getUser: mocks.getUser,
                exchangeCodeForSession: mocks.exchangeCodeForSession,
            },
        });
        mocks.consumeAddBusinessOAuth.mockResolvedValue(null);
        mocks.canAddBusinessToOrganization.mockResolvedValue(false);
        mocks.createAdminClient.mockReturnValue({});
        mocks.resolveOAuthInviteParam.mockResolvedValue(null);
        mocks.runOAuthAddBusinessFlow.mockResolvedValue(
            NextResponse.redirect("https://app.zyenereviews.com/businesses"),
        );
    });

    it("rejects URL-supplied user and organization IDs before privileged work", async () => {
        const response = await handleOAuthCallback(
            new Request(
                "https://auth.zyenereviews.com/api/auth/callback" +
                    "?code=attacker-code&next=/businesses&add_org=victim-org&add_user=victim-user",
            ),
        );

        expect(response.headers.get("location")).toContain("error=auth_callback_failed");
        expect(mocks.createAdminClient).not.toHaveBeenCalled();
        expect(mocks.runOAuthAddBusinessFlow).not.toHaveBeenCalled();
    });

    it("rejects a state for a foreign organization before code exchange", async () => {
        mocks.consumeAddBusinessOAuth.mockResolvedValue({
            userId: "original-user",
            organizationId: "foreign-org",
        });

        const response = await handleOAuthCallback(new Request(
            "https://auth.zyenereviews.com/api/auth/callback" +
                "?code=google-code&next=/businesses&add_business_state=valid-nonce",
        ));

        expect(response.headers.get("location")).toContain("error=auth_callback_failed");
        expect(mocks.canAddBusinessToOrganization).toHaveBeenCalledWith(
            expect.anything(), "original-user", "foreign-org",
        );
        expect(mocks.exchangeCodeForSession).not.toHaveBeenCalled();
        expect(mocks.createAdminClient).not.toHaveBeenCalled();
    });

    it("rejects an add-business callback without the original login session", async () => {
        mocks.getUser.mockResolvedValue({ data: { user: null } });

        const response = await handleOAuthCallback(new Request(
            "https://auth.zyenereviews.com/api/auth/callback" +
                "?code=google-code&next=/businesses&add_business_state=valid-nonce",
        ));

        expect(response.headers.get("location")).toContain("error=auth_callback_failed");
        expect(mocks.consumeAddBusinessOAuth).not.toHaveBeenCalled();
        expect(mocks.exchangeCodeForSession).not.toHaveBeenCalled();
    });

    it("passes only the verified initiating identity and organization to admin flow", async () => {
        mocks.consumeAddBusinessOAuth.mockResolvedValue({
            userId: "original-user",
            organizationId: "verified-org",
        });
        mocks.canAddBusinessToOrganization.mockResolvedValue(true);

        await handleOAuthCallback(new Request(
            "https://auth.zyenereviews.com/api/auth/callback" +
                "?code=google-code&next=/businesses&add_business_state=valid-nonce",
        ));

        expect(mocks.runOAuthAddBusinessFlow).toHaveBeenCalledWith(expect.objectContaining({
            originalUserId: "original-user",
            addBusinessOrgId: "verified-org",
            data: expect.objectContaining({ user: { id: "google-user" } }),
        }));
    });
});
