export type GoogleOAuthCallbackOutcome =
    | { kind: "code"; code: string }
    | { kind: "error"; message: string }
    | { kind: "none" };

export function getGoogleOAuthCallbackOutcome(search: string): GoogleOAuthCallbackOutcome {
    const params = new URLSearchParams(search);
    const code = params.get("code");
    if (code) return { kind: "code", code };

    const error = params.get("error");
    if (!error) return { kind: "none" };

    return {
        kind: "error",
        message:
            error === "access_denied"
                ? "Google connection was canceled. You can try again or enter your business details manually."
                : "Google connection did not finish. You can try again or enter your business details manually.",
    };
}
