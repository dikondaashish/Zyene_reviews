import {
    getCloverAppId,
    getCloverAppSecret,
    getCloverAuthorizeBaseUrl,
    getCloverApiBaseUrl,
    getCloverEnvironment,
    getCloverOAuthRedirectUri,
} from "@/services/clover/config";

export type CloverOAuthState = {
    businessId: string;
    userId: string;
    nonce: string;
};

export type CloverTokenResponse = {
    access_token: string;
    refresh_token?: string;
    access_token_expiration?: number;
    refresh_token_expiration?: number;
    merchant_id?: string;
};

export function encodeCloverOAuthState(state: CloverOAuthState): string {
    return Buffer.from(JSON.stringify(state)).toString("base64url");
}

export function decodeCloverOAuthState(raw: string): CloverOAuthState {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf-8")) as CloverOAuthState;
    if (!parsed?.businessId || !parsed?.userId) {
        throw new Error("Invalid Clover OAuth state");
    }
    return parsed;
}

export function buildCloverAuthorizeUrl(state: CloverOAuthState): string {
    const appId = getCloverAppId();
    if (!appId) throw new Error("CLOVER_APP_ID is not configured");

    const params = new URLSearchParams({
        client_id: appId,
        response_type: "code",
        redirect_uri: getCloverOAuthRedirectUri(),
        state: encodeCloverOAuthState(state),
    });

    return `${getCloverAuthorizeBaseUrl()}/oauth/v2/authorize?${params.toString()}`;
}

export async function exchangeCloverCodeForTokens(code: string): Promise<CloverTokenResponse> {
    const appId = getCloverAppId();
    const appSecret = getCloverAppSecret();
    if (!appId || !appSecret) {
        throw new Error("Clover app credentials are not configured");
    }

    const res = await fetch(`${getCloverApiBaseUrl()}/oauth/v2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: appId,
            client_secret: appSecret,
            code,
        }),
    });

    const body = (await res.json()) as CloverTokenResponse & { message?: string; error?: string };
    if (!res.ok || !body.access_token) {
        throw new Error(body.message || body.error || `Clover token exchange failed (${res.status})`);
    }
    return body;
}

export function cloverEnvLabel(): string {
    return getCloverEnvironment();
}
