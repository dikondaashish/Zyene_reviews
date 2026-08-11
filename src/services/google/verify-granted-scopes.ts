import { logger } from "@/lib/logger";

/**
 * E-2: what scopes a Google access token ACTUALLY carries, observed rather
 * than assumed.
 *
 * The Supabase-Auth reconnect flow (`oauth-callback-existing-user.ts`) only
 * gets back a `Session` from `exchangeCodeForSession` — Google's raw token
 * response, which carries the `scope` field, never reaches application code
 * that way. Calling Google's own tokeninfo endpoint with the access token is
 * the only way that flow can observe what was granted, matching how the
 * onboarding code-exchange flow already records `granted_scopes` verbatim
 * from the token response it DOES see.
 *
 * Never throws: a failed verification must not break a reconnect that
 * otherwise succeeded. Callers get null and leave `granted_scopes` untouched,
 * same as when Google's token response omits `scope`.
 */
export async function fetchGoogleGrantedScopes(accessToken: string): Promise<string | null> {
    try {
        const response = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
        );
        if (!response.ok) {
            logger.warn({ status: response.status }, "[Google tokeninfo] scope verification failed");
            return null;
        }
        const data = (await response.json()) as { scope?: string };
        return data.scope?.trim() || null;
    } catch (error) {
        logger.warn({ err: error }, "[Google tokeninfo] scope verification request failed");
        return null;
    }
}
