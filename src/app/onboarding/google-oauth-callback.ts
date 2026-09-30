export type GoogleOAuthCallbackOutcome =
    | { kind: "code"; code: string; state: string }
    | { kind: "error"; message: string }
    | { kind: "none" };

export function getGoogleOAuthCallbackOutcome(search: string): GoogleOAuthCallbackOutcome {
    const params = new URLSearchParams(search);
    const code = params.get("code");
    if (code) {
        const state = params.get("state");
        if (state && /^[A-Za-z0-9_-]{43}$/.test(state)) return { kind: "code", code, state };
        return { kind: "error", message: "Google connection state is missing or invalid. Please reconnect." };
    }

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
