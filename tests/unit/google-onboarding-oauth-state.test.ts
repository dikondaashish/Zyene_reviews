import { beforeEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ get: vi.fn(), getdel: vi.fn(), set: vi.fn(), cookieGet: vi.fn(), cookieSet: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: m.cookieGet, set: m.cookieSet }) }));
vi.mock("@/lib/db/redis", () => ({ redis: { get: m.get, getdel: m.getdel, set: m.set } }));
import { beginGoogleOnboardingOAuth, consumeGoogleOnboardingOAuth } from "@/services/google/onboarding-oauth-state";
const nonce = "a".repeat(43);
const data = { userId: "u", businessId: "b", redirectUri: "http://localhost/onboarding" };
beforeEach(() => {
    vi.resetAllMocks(); m.cookieGet.mockReturnValue({ value: nonce });
    m.get.mockResolvedValue(data); m.getdel.mockResolvedValue(data);
});
describe("Google onboarding OAuth state", () => {
    it("stores a short-lived state and an HTTP-only same-site cookie", async () => {
        const state = await beginGoogleOnboardingOAuth(data);
        expect(state).toHaveLength(43);
        expect(m.set).toHaveBeenCalledWith(`google-onboarding-state:${state}`, data, { ex: 300 });
        expect(m.cookieSet).toHaveBeenCalledWith("google_onboarding_state", state,
            expect.objectContaining({ httpOnly: true, sameSite: "lax", maxAge: 300 }));
    });
    it.each([["b".repeat(43), "u", "b"], [nonce, "foreign-user", "b"], [nonce, "u", "foreign-business"]])
        ("rejects mismatched browser state, identity or tenant", async (state, u, b) => {
            expect(await consumeGoogleOnboardingOAuth(state, u, b)).toBeNull();
            expect(m.getdel).not.toHaveBeenCalled();
        });
    it("rejects expired state and a callback without the initiating cookie", async () => {
        m.get.mockResolvedValue(null);
        expect(await consumeGoogleOnboardingOAuth(nonce, "u", "b")).toBeNull();
        m.cookieGet.mockReturnValue(undefined);
        expect(await consumeGoogleOnboardingOAuth(nonce, "u", "b")).toBeNull();
    });
    it("consumes a valid state only once", async () => {
        expect(await consumeGoogleOnboardingOAuth(nonce, "u", "b")).toEqual(data);
        m.getdel.mockResolvedValue(null);
        expect(await consumeGoogleOnboardingOAuth(nonce, "u", "b")).toBeNull();
        expect(m.cookieSet).toHaveBeenCalledWith("google_onboarding_state", "", expect.objectContaining({ maxAge: 0 }));
    });
});
