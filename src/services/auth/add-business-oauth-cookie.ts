import { cookies } from "next/headers";
import {
    ADD_BUSINESS_OAUTH_COOKIE,
    ADD_BUSINESS_OAUTH_TTL_SECONDS,
    createAddBusinessOAuthState,
    verifyAddBusinessOAuthState,
} from "@/services/auth/add-business-oauth-state";

function cookieOptions() {
    const configuredRoot = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const host = configuredRoot.replace(/^https?:\/\//, "").split(":")[0]
        .replace(/^(?:www\.|app\.|auth\.)/, "");
    return {
        domain: host === "localhost" || host === "127.0.0.1" ? undefined : `.${host}`,
        httpOnly: true,
        maxAge: ADD_BUSINESS_OAUTH_TTL_SECONDS,
        path: "/api/auth/callback",
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
    };
}

function signingSecret(): string {
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret) throw new Error("OAuth state signing secret is missing");
    return secret;
}

export async function beginAddBusinessOAuth(userId: string, organizationId: string) {
    const state = createAddBusinessOAuthState(userId, organizationId, signingSecret());
    (await cookies()).set(ADD_BUSINESS_OAUTH_COOKIE, state.cookieValue, cookieOptions());
    return state.nonce;
}

export async function consumeAddBusinessOAuth(nonce: string, expectedUserId: string) {
    const store = await cookies();
    const value = store.get(ADD_BUSINESS_OAUTH_COOKIE)?.value;
    store.set(ADD_BUSINESS_OAUTH_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
    return verifyAddBusinessOAuthState(nonce, value, expectedUserId, signingSecret());
}
