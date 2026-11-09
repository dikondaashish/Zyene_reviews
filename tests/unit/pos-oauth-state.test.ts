import { afterEach, describe, expect, it, vi } from "vitest";
import { createPosOAuthState, verifyPosOAuthState } from "@/lib/auth/pos-oauth-state";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_USER = "33333333-3333-4333-8333-333333333333";
const BUSINESS_ID = "22222222-2222-4222-8222-222222222222";
const SECRET = "test-only-pos-secret";

describe("POS OAuth state", () => {
    afterEach(() => vi.useRealTimers());

    it("binds nonce, user and business to a signed cookie", () => {
        const state = createPosOAuthState("square", USER_ID, BUSINESS_ID, SECRET);
        expect(verifyPosOAuthState("square", state.nonce, state.cookieValue, USER_ID, SECRET))
            .toMatchObject({ userId: USER_ID, businessId: BUSINESS_ID });
    });

    it("rejects a forged nonce, another user, a wrong secret or a missing cookie", () => {
        const state = createPosOAuthState("square", USER_ID, BUSINESS_ID, SECRET);
        expect(verifyPosOAuthState("square", "forged", state.cookieValue, USER_ID, SECRET)).toBeNull();
        expect(verifyPosOAuthState("square", state.nonce, state.cookieValue, OTHER_USER, SECRET)).toBeNull();
        expect(verifyPosOAuthState("square", state.nonce, state.cookieValue, USER_ID, "wrong")).toBeNull();
        expect(verifyPosOAuthState("square", state.nonce, undefined, USER_ID, SECRET)).toBeNull();
        expect(verifyPosOAuthState("square", null, state.cookieValue, USER_ID, SECRET)).toBeNull();
    });

    it("rejects a tampered payload or signature", () => {
        const state = createPosOAuthState("clover", USER_ID, BUSINESS_ID, SECRET);
        const [payload, sig] = state.cookieValue.split(".");
        const swapped = Buffer.from(JSON.stringify({
            ...JSON.parse(Buffer.from(payload, "base64url").toString()),
            businessId: "44444444-4444-4444-8444-444444444444",
        })).toString("base64url");
        expect(verifyPosOAuthState("clover", state.nonce, `${swapped}.${sig}`, USER_ID, SECRET)).toBeNull();
        expect(verifyPosOAuthState("clover", state.nonce, `${payload}.${sig.slice(0, -2)}aa`, USER_ID, SECRET))
            .toBeNull();
        expect(verifyPosOAuthState("clover", state.nonce, `${state.cookieValue}.extra`, USER_ID, SECRET))
            .toBeNull();
    });

    it("does not accept a Square state on the Clover callback", () => {
        const state = createPosOAuthState("square", USER_ID, BUSINESS_ID, SECRET);
        expect(verifyPosOAuthState("clover", state.nonce, state.cookieValue, USER_ID, SECRET)).toBeNull();
    });

    it("expires after ten minutes", () => {
        vi.useFakeTimers();
        const state = createPosOAuthState("square", USER_ID, BUSINESS_ID, SECRET);
        vi.advanceTimersByTime(600_001);
        expect(verifyPosOAuthState("square", state.nonce, state.cookieValue, USER_ID, SECRET)).toBeNull();
    });

    it("refuses to issue state without a secret", () => {
        expect(() => createPosOAuthState("square", USER_ID, BUSINESS_ID, "")).toThrow();
    });
});
