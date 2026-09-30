import { beforeEach, describe, expect, it } from "vitest";
import { createFacebookOAuthState, verifyFacebookOAuthState } from "@/services/facebook/oauth-state";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const BUSINESS_ID = "22222222-2222-4222-8222-222222222222";

describe("Facebook OAuth state", () => {
    beforeEach(() => { process.env.FACEBOOK_APP_SECRET = "test-only-facebook-secret"; });

    it("binds nonce, user, and business to a signed expiring cookie", () => {
        const state = createFacebookOAuthState(USER_ID, BUSINESS_ID, "test-secret");
        expect(verifyFacebookOAuthState(state.nonce, state.cookieValue, USER_ID, "test-secret"))
            .toMatchObject({ businessId: BUSINESS_ID, userId: USER_ID });
        expect(verifyFacebookOAuthState(state.nonce, state.cookieValue,
            "33333333-3333-4333-8333-333333333333", "test-secret")).toBeNull();
        expect(verifyFacebookOAuthState("forged", state.cookieValue, USER_ID, "test-secret")).toBeNull();
        expect(verifyFacebookOAuthState(state.nonce, state.cookieValue, USER_ID, "wrong-secret")).toBeNull();
    });

    it("rejects unsigned and tampered state", () => {
        const state = createFacebookOAuthState(USER_ID, BUSINESS_ID, "test-secret");
        const altered = `${state.cookieValue.slice(0, -2)}aa`;
        expect(verifyFacebookOAuthState(state.nonce, undefined, USER_ID, "test-secret")).toBeNull();
        expect(verifyFacebookOAuthState(state.nonce, altered, USER_ID, "test-secret")).toBeNull();
    });
});
