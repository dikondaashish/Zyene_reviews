import { randomBytes, timingSafeEqual } from "node:crypto";
import { redis } from "@/lib/db/redis";
import { getAppBaseUrl } from "@/config/env";

/**
 * State for the Settings > Integrations Google (re)connect.
 *
 * This flow never goes through Supabase Auth: a Supabase `signInWithOAuth`
 * would replace the owner's session with whichever Google account consented,
 * so the reconnect could sign them in as someone else. Instead the nonce is
 * bound to the signed-in user and the business they picked, kept server-side
 * in Redis, and echoed by an HTTP-only cookie scoped to the callback path.
 */
export const GOOGLE_INTEGRATION_STATE_COOKIE = "google_integration_state";
export const GOOGLE_INTEGRATION_CALLBACK_PATH = "/api/integrations/google/callback";
export const GOOGLE_INTEGRATION_STATE_TTL_SECONDS = 600;
const NONCE_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export type GoogleIntegrationOAuthPurpose = "connect" | "search_console";
export interface GoogleIntegrationOAuthState {
    userId: string;
    businessId: string;
    purpose: GoogleIntegrationOAuthPurpose;
}

export function getGoogleIntegrationRedirectUri(): string {
    return `${getAppBaseUrl()}${GOOGLE_INTEGRATION_CALLBACK_PATH}`;
}

export function googleIntegrationCookieOptions(maxAge: number) {
    return {
        httpOnly: true,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
        path: GOOGLE_INTEGRATION_CALLBACK_PATH,
        maxAge,
    };
}

export async function beginGoogleIntegrationOAuth(state: GoogleIntegrationOAuthState): Promise<string> {
    const nonce = randomBytes(32).toString("base64url");
    await redis.set(`google-integration-state:${nonce}`, state, { ex: GOOGLE_INTEGRATION_STATE_TTL_SECONDS });
    return nonce;
}

/** One-time consume; null unless the nonce, cookie and signed-in user all match. */
export async function consumeGoogleIntegrationOAuth(
    nonce: string | null,
    cookieValue: string | undefined,
    userId: string,
): Promise<GoogleIntegrationOAuthState | null> {
    if (!nonce || !cookieValue || !NONCE_PATTERN.test(nonce) || !NONCE_PATTERN.test(cookieValue)) return null;
    if (!timingSafeEqual(Buffer.from(nonce), Buffer.from(cookieValue))) return null;
    const key = `google-integration-state:${nonce}`;
    const peek = await redis.get<GoogleIntegrationOAuthState>(key);
    if (!peek || peek.userId !== userId) return null;
    const consumed = await redis.getdel<GoogleIntegrationOAuthState>(key);
    if (!consumed || consumed.userId !== userId) return null;
    return consumed;
}
