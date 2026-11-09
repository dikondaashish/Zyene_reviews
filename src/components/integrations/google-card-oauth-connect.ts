/**
 * Settings > Integrations Google (re)connect.
 *
 * Deliberately NOT `supabase.auth.signInWithOAuth`: that replaces the browser's
 * Supabase session with whichever Google account consents, so reconnecting with
 * a Google account other than the owner's Zyene login signed them in as that
 * account (and ran new-user signup) instead of updating their business. The
 * server route binds the OAuth state to the signed-in user and this business,
 * checks they can manage it, and exchanges the code without touching the session.
 */
export function buildGoogleIntegrationConnectPath(
    businessId: string,
    purpose: "connect" | "search_console" = "connect",
): string {
    const params = new URLSearchParams({ businessId });
    if (purpose !== "connect") params.set("purpose", purpose);
    return `/api/integrations/google/connect?${params.toString()}`;
}

export async function startGoogleOAuthConnect(businessId: string): Promise<void> {
    window.location.href = buildGoogleIntegrationConnectPath(businessId);
}

/**
 * E-2: incremental consent for Search Console. `include_granted_scopes` widens
 * the existing grant instead of replacing it, so this never drops
 * `business.manage` access.
 */
export async function startGoogleSearchConsoleConnect(businessId: string): Promise<void> {
    window.location.href = buildGoogleIntegrationConnectPath(businessId, "search_console");
}
