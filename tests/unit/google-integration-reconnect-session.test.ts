import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
    createClient: vi.fn(), canManage: vi.fn(), exchange: vi.fn(), apply: vi.fn(),
    signInWithOAuth: vi.fn(), exchangeCodeForSession: vi.fn(),
    store: new Map<string, unknown>(),
}));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: m.createClient }));
vi.mock("@/lib/db/supabase/client", () => ({ createClient: () => ({ auth: { signInWithOAuth: m.signInWithOAuth } }) }));
vi.mock("@/lib/auth/manage-business-integration", () => ({ canManageBusinessIntegration: m.canManage }));
vi.mock("@/app/actions/onboarding/google-oauth-helpers", () => ({ exchangeGoogleAuthCode: m.exchange }));
vi.mock("@/services/google/integration-reconnect", () => ({ applyGoogleIntegrationTokens: m.apply }));
vi.mock("@/config/env", () => ({
    getAppBaseUrl: () => "https://app.example.com",
    getAppIntegrationsUrl: () => "https://app.example.com/settings/integrations",
}));
vi.mock("@/lib/db/redis", () => ({
    redis: {
        set: async (k: string, v: unknown) => { m.store.set(k, v); },
        get: async (k: string) => m.store.get(k) ?? null,
        getdel: async (k: string) => { const v = m.store.get(k) ?? null; m.store.delete(k); return v; },
    },
}));

import { GET as connect } from "@/app/api/integrations/google/connect/route";
import { GET as callback } from "@/app/api/integrations/google/callback/route";
import { startGoogleOAuthConnect, startGoogleSearchConsoleConnect } from "@/components/integrations/google-card-oauth-connect";
import { GOOGLE_INTEGRATION_STATE_COOKIE } from "@/services/google/integration-oauth-state";

const OWNER = "11111111-1111-4111-8111-111111111111";
const OTHER = "33333333-3333-4333-8333-333333333333";
const BIZ = "22222222-2222-4222-8222-222222222222";
const tokens = { accessToken: "synthetic-access", refreshToken: "synthetic-refresh", expiresIn: 3600 };

function signedInAs(id: string) {
    m.createClient.mockResolvedValue({
        auth: { getUser: async () => ({ data: { user: { id } } }), exchangeCodeForSession: m.exchangeCodeForSession },
    });
}

async function startConsent(purpose?: string) {
    const qs = new URLSearchParams({ businessId: BIZ, ...(purpose ? { purpose } : {}) });
    const res = await connect(new Request(`https://app.example.com/api/integrations/google/connect?${qs}`));
    const location = new URL(res.headers.get("location") ?? "https://none.invalid/");
    return { res, location, nonce: location.searchParams.get("state") ?? "", cookie: res.cookies.get(GOOGLE_INTEGRATION_STATE_COOKIE) };
}

function returnFromGoogle(nonce: string, cookie?: string) {
    const req = new NextRequest(`https://app.example.com/api/integrations/google/callback?code=auth-code&state=${nonce}`);
    if (cookie) req.cookies.set(GOOGLE_INTEGRATION_STATE_COOKIE, cookie);
    return callback(req);
}

beforeEach(() => {
    vi.clearAllMocks(); m.store.clear();
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = "test-client-id";
    signedInAs(OWNER);
    m.canManage.mockResolvedValue(true);
    m.exchange.mockResolvedValue(tokens);
    m.apply.mockResolvedValue({ ok: true });
});

describe("Integrations Google reconnect never swaps the Supabase session", () => {
    it("card reconnect goes to the server route instead of Supabase signInWithOAuth", async () => {
        const location = { href: "" };
        vi.stubGlobal("window", { location });
        await startGoogleOAuthConnect(BIZ);
        expect(location.href).toBe(`/api/integrations/google/connect?businessId=${BIZ}`);
        await startGoogleSearchConsoleConnect(BIZ);
        expect(location.href).toBe(`/api/integrations/google/connect?businessId=${BIZ}&purpose=search_console`);
        expect(m.signInWithOAuth).not.toHaveBeenCalled();
        vi.unstubAllGlobals();
    });

    it("refuses to start consent for a business the user cannot manage", async () => {
        m.canManage.mockResolvedValue(false);
        const { res } = await startConsent();
        expect(res.status).toBe(403);
        expect(m.store.size).toBe(0);
    });

    it("starts Google consent bound to this user and business with our own callback", async () => {
        const { location, nonce, cookie } = await startConsent();
        expect(location.origin + location.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
        expect(location.searchParams.get("redirect_uri")).toBe("https://app.example.com/api/integrations/google/callback");
        expect(location.searchParams.get("scope")).toBe("https://www.googleapis.com/auth/business.manage");
        expect(location.searchParams.get("include_granted_scopes")).toBeNull();
        expect(cookie?.value).toBe(nonce);
        expect(cookie?.httpOnly).toBe(true);
        expect(m.store.get(`google-integration-state:${nonce}`)).toEqual({ userId: OWNER, businessId: BIZ, purpose: "connect" });
    });

    it("Search Console consent widens the existing grant", async () => {
        const { location } = await startConsent("search_console");
        expect(location.searchParams.get("scope")).toContain("webmasters.readonly");
        expect(location.searchParams.get("include_granted_scopes")).toBe("true");
    });

    it("stores tokens on the chosen business without exchanging a Supabase session", async () => {
        const { nonce, cookie } = await startConsent();
        const res = await returnFromGoogle(nonce, cookie?.value);
        expect(res.headers.get("location")).toBe("https://app.example.com/settings/integrations?google=connected");
        expect(m.exchange).toHaveBeenCalledWith("auth-code", "https://app.example.com/api/integrations/google/callback");
        expect(m.apply).toHaveBeenCalledWith(OWNER, BIZ, tokens);
        expect(m.exchangeCodeForSession).not.toHaveBeenCalled();
        // One-time state: replay is rejected.
        const replay = await returnFromGoogle(nonce, cookie?.value);
        expect(replay.headers.get("location")).toContain("google_error=invalid_state");
        expect(m.apply).toHaveBeenCalledTimes(1);
    });

    it("rejects a callback without the initiating browser cookie", async () => {
        const { nonce } = await startConsent();
        const res = await returnFromGoogle(nonce);
        expect(res.headers.get("location")).toContain("google_error=invalid_state");
        expect(m.exchange).not.toHaveBeenCalled();
    });

    it("rejects state issued to a different signed-in user", async () => {
        const { nonce, cookie } = await startConsent();
        signedInAs(OTHER);
        const res = await returnFromGoogle(nonce, cookie?.value);
        expect(res.headers.get("location")).toContain("google_error=invalid_state");
        expect(m.exchange).not.toHaveBeenCalled();
    });

    it("rejects when the user lost manage access before returning", async () => {
        const { nonce, cookie } = await startConsent();
        m.canManage.mockResolvedValue(false);
        const res = await returnFromGoogle(nonce, cookie?.value);
        expect(res.headers.get("location")).toContain("google_error=invalid_state");
        expect(m.exchange).not.toHaveBeenCalled();
        expect(m.apply).not.toHaveBeenCalled();
    });
});
