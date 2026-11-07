import { fetchWithTimeout } from "@/lib/http/fetch-with-timeout";
/** Google OAuth refresh-token exchange. */
import { logger } from "@/lib/logger";

import type { GoogleTokenResponse } from "./business-profile-core";

/** Same OAuth client must be used for refresh as for the initial consent (often NEXT_PUBLIC_GOOGLE_CLIENT_ID). */
function getGoogleOAuthClientId(): string | undefined {
    return process.env.GOOGLE_CLIENT_ID?.trim() || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
}

/** False when the server is missing the OAuth client credentials (an env problem, not a token problem). */
export function isGoogleOAuthConfigured(): boolean {
    return Boolean(getGoogleOAuthClientId() && process.env.GOOGLE_CLIENT_SECRET);
}

/** Google's token endpoint answered non-2xx; `status` separates its own outages (5xx/429) from bad tokens. */
export class GoogleTokenRefreshError extends Error {
    constructor(readonly status: number, statusText: string, body: string) {
        super(`Failed to refresh token: ${status} ${statusText} - ${body}`);
        this.name = "GoogleTokenRefreshError";
    }

    /** Google-side failure (e.g. 500 internal_failure) that a later attempt normally clears. */
    get isTransient(): boolean {
        return this.status >= 500 || this.status === 429;
    }
}

/** Pause before the single in-call retry of a transient Google failure. */
const TRANSIENT_RETRY_DELAY_MS = 1000;

async function requestTokenRefresh(clientId: string, clientSecret: string, refreshToken: string) {
    const response = await fetchWithTimeout("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }),
    });
    if (response.ok) return (await response.json()) as GoogleTokenResponse;
    throw new GoogleTokenRefreshError(response.status, response.statusText, await response.text());
}

export async function refreshGoogleToken(refreshToken: string): Promise<GoogleTokenResponse> {
    const clientId = getGoogleOAuthClientId();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Missing Google Client ID or Secret in environment variables");
    }

    try {
        return await requestTokenRefresh(clientId, clientSecret, refreshToken);
    } catch (error: unknown) {
        if (!(error instanceof GoogleTokenRefreshError) || !error.isTransient) {
            if (error instanceof GoogleTokenRefreshError) {
                logger.error(`[Token] Google Refresh Error (${error.status}): ${error.message}`);
            }
            throw error;
        }
        logger.warn({ status: error.status }, "[Token] Google refresh hit a transient error; retrying once");
        await new Promise((resolve) => setTimeout(resolve, TRANSIENT_RETRY_DELAY_MS));
        return requestTokenRefresh(clientId, clientSecret, refreshToken);
    }
}
