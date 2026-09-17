import { describe, expect, it } from "vitest";

import { getGoogleOAuthCallbackOutcome } from "@/app/onboarding/google-oauth-callback";

describe("getGoogleOAuthCallbackOutcome", () => {
    it("keeps a successful OAuth code for the connection flow", () => {
        expect(getGoogleOAuthCallbackOutcome("?code=google-code")).toEqual({
            kind: "code",
            code: "google-code",
        });
    });

    it("returns a recovery message when Google consent is canceled", () => {
        expect(getGoogleOAuthCallbackOutcome("?error=access_denied")).toEqual({
            kind: "error",
            message: "Google connection was canceled. You can try again or enter your business details manually.",
        });
    });

    it("does not turn unrelated onboarding URLs into connection failures", () => {
        expect(getGoogleOAuthCallbackOutcome("?checkout_canceled=1")).toEqual({ kind: "none" });
    });
});
