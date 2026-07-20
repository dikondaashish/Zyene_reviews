import {
    getSquareApplicationId,
    getSquareApplicationSecret,
    getSquareConnectBaseUrl,
    getSquareOAuthRedirectUri,
    getSquareEnvironment,
    SQUARE_OAUTH_SCOPES,
} from "@/services/square/config";

export type SquareOAuthState = {
    businessId: string;
    userId: string;
    nonce: string;
};

export type SquareTokenResponse = {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
    merchant_id?: string;
    token_type?: string;
};

export function encodeSquareOAuthState(state: SquareOAuthState): string {
    return Buffer.from(JSON.stringify(state)).toString("base64url");
}

export function decodeSquareOAuthState(raw: string): SquareOAuthState {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf-8")) as SquareOAuthState;
    if (!parsed?.businessId || !parsed?.userId) {
        throw new Error("Invalid Square OAuth state");
    }
    return parsed;
}

export function buildSquareAuthorizeUrl(state: SquareOAuthState): string {
    const appId = getSquareApplicationId();
    if (!appId) throw new Error("SQUARE_APPLICATION_ID is not configured");

    const params = new URLSearchParams({
        client_id: appId,
        scope: SQUARE_OAUTH_SCOPES.join(" "),
        session: "false",
        state: encodeSquareOAuthState(state),
    });

    return `${getSquareConnectBaseUrl()}/oauth2/authorize?${params.toString()}`;
}

export async function exchangeSquareCodeForTokens(code: string): Promise<SquareTokenResponse> {
    const appId = getSquareApplicationId();
    const appSecret = getSquareApplicationSecret();
    if (!appId || !appSecret) {
        throw new Error("Square app credentials are not configured");
    }

    const res = await fetch(`${getSquareConnectBaseUrl()}/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
            client_id: appId,
            client_secret: appSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: getSquareOAuthRedirectUri(),
        }),
    });

    const body = (await res.json()) as SquareTokenResponse & {
        message?: string;
        errors?: Array<{ detail?: string }>;
    };
    if (!res.ok || !body.access_token) {
        const detail = body.errors?.[0]?.detail || body.message;
        throw new Error(detail || `Square token exchange failed (${res.status})`);
    }
    return body;
}

export function squareEnvLabel(): string {
    return getSquareEnvironment();
}
