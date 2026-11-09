import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
    createClient: vi.fn(), canManage: vi.fn(),
    exchangeSquare: vi.fn(), exchangeClover: vi.fn(),
    storeSquare: vi.fn(), storeClover: vi.fn(),
}));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: () => ({}) }));
vi.mock("@/lib/auth/manage-business-integration", () => ({ canManageBusinessIntegration: mocks.canManage }));
vi.mock("@/config/env", () => ({
    getAppBaseUrl: () => "https://app.example.com",
    getAppIntegrationsUrl: () => "https://app.example.com/integrations",
}));
vi.mock("@/services/square/oauth", () => ({ exchangeSquareCodeForTokens: mocks.exchangeSquare }));
vi.mock("@/services/clover/oauth", () => ({ exchangeCloverCodeForTokens: mocks.exchangeClover }));
vi.mock("@/services/square/store-connection", () => ({ storeSquareConnection: mocks.storeSquare }));
vi.mock("@/services/clover/store-connection", () => ({ storeCloverConnection: mocks.storeClover }));

import { GET as squareCallback } from "@/app/api/integrations/square/callback/route";
import { GET as cloverCallback } from "@/app/api/integrations/clover/callback/route";
import { createPosOAuthState, posOAuthStateCookieName, type PosOAuthProvider } from "@/lib/auth/pos-oauth-state";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const BUSINESS_ID = "22222222-2222-4222-8222-222222222222";

const cases = [
    { provider: "square", handler: squareCallback, exchange: mocks.exchangeSquare, store: mocks.storeSquare },
    { provider: "clover", handler: cloverCallback, exchange: mocks.exchangeClover, store: mocks.storeClover },
] as const;

function secretFor(provider: PosOAuthProvider) {
    return provider === "square" ? process.env.SQUARE_APPLICATION_SECRET! : process.env.CLOVER_APP_SECRET!;
}

function callback(provider: PosOAuthProvider, state: string, cookie?: string) {
    const request = new NextRequest(
        `https://app.example.com/api/integrations/${provider}/callback?code=attacker-code&state=${encodeURIComponent(state)}`,
    );
    if (cookie) request.cookies.set(posOAuthStateCookieName(provider), cookie);
    return request;
}

describe.each(cases)("$provider OAuth callback state binding", ({ provider, handler, exchange, store }) => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.SQUARE_APPLICATION_SECRET = "test-only-square-secret";
        process.env.CLOVER_APP_SECRET = "test-only-clover-secret";
        mocks.createClient.mockResolvedValue({
            auth: { getUser: async () => ({ data: { user: { id: USER_ID } } }) },
        });
        mocks.canManage.mockResolvedValue(true);
        exchange.mockResolvedValue({ access_token: "t", merchant_id: "M1" });
        store.mockResolvedValue(undefined);
    });

    it("rejects the old forgeable base64 state with no cookie", async () => {
        const forged = Buffer.from(JSON.stringify({ businessId: BUSINESS_ID, userId: USER_ID, nonce: "x" }))
            .toString("base64url");
        const response = await handler(callback(provider, forged));
        expect(response.headers.get("location")).toContain(`${provider}_error=invalid_state`);
        expect(exchange).not.toHaveBeenCalled();
        expect(store).not.toHaveBeenCalled();
    });

    it("rejects a state cookie issued to another user", async () => {
        const state = createPosOAuthState(provider, "33333333-3333-4333-8333-333333333333", BUSINESS_ID,
            secretFor(provider));
        const response = await handler(callback(provider, state.nonce, state.cookieValue));
        expect(response.headers.get("location")).toContain(`${provider}_error=invalid_state`);
        expect(exchange).not.toHaveBeenCalled();
    });

    it("rejects a verified state when the user can no longer manage the business", async () => {
        const state = createPosOAuthState(provider, USER_ID, BUSINESS_ID, secretFor(provider));
        mocks.canManage.mockResolvedValue(false);
        const response = await handler(callback(provider, state.nonce, state.cookieValue));
        expect(response.headers.get("location")).toContain(`${provider}_error=forbidden`);
        expect(exchange).not.toHaveBeenCalled();
    });

    it("connects the bound business and clears the one-shot cookie", async () => {
        const state = createPosOAuthState(provider, USER_ID, BUSINESS_ID, secretFor(provider));
        const response = await handler(callback(provider, state.nonce, state.cookieValue));
        expect(response.headers.get("location")).toContain(`${provider}_connected=1`);
        expect(store).toHaveBeenCalledWith(expect.objectContaining({ businessId: BUSINESS_ID, merchantId: "M1" }));
        const cleared = response.cookies.get(posOAuthStateCookieName(provider));
        expect(cleared?.value).toBe("");
        expect(cleared?.maxAge).toBe(0);
    });
});
