import { describe, expect, it } from "vitest";
import {
    ADD_BUSINESS_OAUTH_TTL_SECONDS,
    createAddBusinessOAuthState,
    verifyAddBusinessOAuthState,
} from "@/services/auth/add-business-oauth-state";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_USER_ID = "22222222-2222-4222-8222-222222222222";
const ORG_ID = "33333333-3333-4333-8333-333333333333";
const SECRET = "test-only-signing-secret";
const NOW = 1_800_000_000_000;

describe("add-business OAuth state", () => {
    it("binds the state to the initiating user and organization", () => {
        const state = createAddBusinessOAuthState(USER_ID, ORG_ID, SECRET, NOW);

        expect(verifyAddBusinessOAuthState(
            state.nonce, state.cookieValue, USER_ID, SECRET, NOW + 1000,
        )).toMatchObject({ userId: USER_ID, organizationId: ORG_ID });
        expect(state.cookieValue).not.toContain(USER_ID);
        expect(state.cookieValue).not.toContain(ORG_ID);
    });

    it("rejects another user's session and a different callback nonce", () => {
        const state = createAddBusinessOAuthState(USER_ID, ORG_ID, SECRET, NOW);

        expect(verifyAddBusinessOAuthState(
            state.nonce, state.cookieValue, OTHER_USER_ID, SECRET, NOW,
        )).toBeNull();
        expect(verifyAddBusinessOAuthState(
            "wrong-state", state.cookieValue, USER_ID, SECRET, NOW,
        )).toBeNull();
    });

    it("rejects expired and tampered cookies", () => {
        const state = createAddBusinessOAuthState(USER_ID, ORG_ID, SECRET, NOW);
        const [payload, mac] = state.cookieValue.split(".");

        expect(verifyAddBusinessOAuthState(
            state.nonce, state.cookieValue, USER_ID, SECRET,
            NOW + ADD_BUSINESS_OAUTH_TTL_SECONDS * 1000,
        )).toBeNull();
        expect(verifyAddBusinessOAuthState(
            state.nonce, `${payload}A.${mac}`, USER_ID, SECRET, NOW,
        )).toBeNull();
    });
});
