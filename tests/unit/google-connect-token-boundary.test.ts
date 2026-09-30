import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
    get: vi.fn(), getdel: vi.fn(), set: vi.fn(), client: vi.fn(), manage: vi.fn(),
    exchange: vi.fn(), locations: vi.fn(), finalize: vi.fn(), consumeState: vi.fn(),
}));
vi.mock("@/lib/db/redis", () => ({ redis: { get: m.get, getdel: m.getdel, set: m.set } }));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: m.client }));
vi.mock("@/services/google/onboarding-oauth-state", () => ({ consumeGoogleOnboardingOAuth: m.consumeState }));
vi.mock("@/lib/auth/manage-business-integration", () => ({ canManageBusinessIntegration: m.manage }));
vi.mock("@/app/actions/onboarding/google-connection-finalize", () => ({ finalizeVerifiedGoogleConnection: m.finalize }));
vi.mock("@/app/actions/onboarding/google-oauth-helpers", () => ({
    exchangeGoogleAuthCode: m.exchange, listGoogleBusinessLocations: m.locations,
    resolveGoogleOAuthRedirectUri: async () => "http://localhost/onboarding",
    mapLocationsForSelection: (locations: unknown) => locations,
}));

import { initializeGoogleAuth, finalizeGoogleConnection } from "@/app/actions/onboarding/google-oauth";
import { consumeGoogleConnectData } from "@/services/google/connect-session";

const B = "11111111-1111-4111-8111-111111111111";
const nonce = "a".repeat(43);
const data = { userId: "u", businessId: B, tokens: { accessToken: "synthetic-access", refreshToken: "synthetic-refresh", expiresIn: 3600 },
    locations: [{ name: "locations/one" }, { name: "locations/two" }] };

beforeEach(() => {
    vi.resetAllMocks();
    m.client.mockResolvedValue({ auth: { getUser: async () => ({ data: { user: { id: "u" } } }) } });
    m.manage.mockResolvedValue(true); m.exchange.mockResolvedValue(data.tokens);
    m.locations.mockResolvedValue(data.locations); m.get.mockResolvedValue(data); m.getdel.mockResolvedValue(data);
    m.finalize.mockResolvedValue({ success: true });
    m.consumeState.mockResolvedValue({ redirectUri: "http://localhost/onboarding" });
});

describe("Google onboarding token and tenant boundaries", () => {
    it("returns only an opaque handle for a multi-location connection", async () => {
        const result = await initializeGoogleAuth("code", B, undefined, nonce);
        expect(result).toMatchObject({ success: true, multipleLocations: true, connectionId: expect.any(String) });
        expect(JSON.stringify(result)).not.toContain("synthetic-access");
        expect(JSON.stringify(result)).not.toContain("synthetic-refresh");
        expect(m.set).toHaveBeenCalledWith(expect.any(String), data, { ex: 300 });
    });
    it("denies another tenant before exchanging a code or storing credentials", async () => {
        m.manage.mockResolvedValue(false);
        expect((await initializeGoogleAuth("code", B, undefined, nonce)).success).toBe(false);
        expect(m.exchange).not.toHaveBeenCalled(); expect(m.set).not.toHaveBeenCalled();
    });
    it.each([["other", B, "locations/one"], ["u", "other-business", "locations/one"], ["u", B, "locations/foreign"]])
        ("denies foreign user, business or location: %s %s %s", async (u, b, l) => {
            expect(await consumeGoogleConnectData(nonce, u, b, l)).toBeNull();
            expect(m.getdel).not.toHaveBeenCalled();
        });
    it("consumes once and uses server-observed location data", async () => {
        await finalizeGoogleConnection(B, "locations/one", nonce);
        expect(m.finalize).toHaveBeenCalledWith(B, data.locations[0], data.tokens);
        m.getdel.mockResolvedValue(null);
        expect((await finalizeGoogleConnection(B, "locations/one", nonce)).success).toBe(false);
        expect(m.finalize).toHaveBeenCalledTimes(1);
    });
    it("rejects a revoked manager before consuming the connection", async () => {
        m.manage.mockResolvedValue(false);
        expect((await finalizeGoogleConnection(B, "locations/one", nonce)).success).toBe(false);
        expect(m.getdel).not.toHaveBeenCalled(); expect(m.finalize).not.toHaveBeenCalled();
    });
    it("fails closed on credential storage outage", async () => {
        m.set.mockRejectedValue(new Error("unavailable"));
        const result = await initializeGoogleAuth("code", B, undefined, nonce);
        expect(result.success).toBe(false);
        expect(JSON.stringify(result)).not.toContain("synthetic-access");
    });
    it("rejects invalid OAuth state before code exchange", async () => {
        m.consumeState.mockResolvedValue(null);
        expect((await initializeGoogleAuth("code", B, undefined, nonce)).success).toBe(false);
        expect(m.exchange).not.toHaveBeenCalled();
    });
});
