import { fetchWithTimeout } from "@/lib/http/fetch-with-timeout";
/** Google OAuth refresh-token exchange. */
import { logger } from "@/lib/logger";

import type { GoogleTokenResponse } from "./business-profile-core";

/** Same OAuth client must be used for refresh as for the initial consent (often NEXT_PUBLIC_GOOGLE_CLIENT_ID). */
function getGoogleOAuthClientId(): string | undefined {
    return process.env.GOOGLE_CLIENT_ID?.trim() || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
}

export async function refreshGoogleToken(refreshToken: string): Promise<GoogleTokenResponse> {
    const clientId = getGoogleOAuthClientId();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Missing Google Client ID or Secret in environment variables");
    }

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

    if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`[Token] Google Refresh Error (${response.status}): ${errorBody}`);
        throw new Error(`Failed to refresh token: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    return response.json();
}
