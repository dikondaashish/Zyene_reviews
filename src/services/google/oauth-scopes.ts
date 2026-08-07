/**
 * Google OAuth scopes, in one place.
 *
 * Previously these were three hardcoded strings in three call sites
 * (onboarding, integrations card, add-business). A scope set that drifts
 * between entry points produces tokens with different powers depending on where
 * the user happened to click, and nothing surfaces the difference until an API
 * returns 403 in production.
 */

/** Identity. Present on the Supabase-Auth flows, absent on the raw onboarding flow. */
export const IDENTITY_SCOPES = ["openid", "email", "profile"] as const;

/** Google Business Profile — reviews, locations, Q&A. The core product. */
export const GBP_SCOPE = "https://www.googleapis.com/auth/business.manage";

/**
 * Google Search Console, read-only.
 *
 * Deliberately NOT part of the default connect flow. This is a SENSITIVE scope
 * in Google's classification, and adding a sensitive scope to the primary
 * consent screen puts the whole screen back through verification. While that is
 * pending, the `business.manage` consent every customer needs can be shown as
 * unverified or blocked outright — so bundling them would risk the core review
 * product to add a reporting feature.
 *
 * Requested incrementally instead: the user connects Google normally, and later
 * opts into Search Console, which adds this scope to the SAME grant via
 * `include_granted_scopes=true`. Read-only because nothing in this product
 * writes to Search Console; requesting the writable `webmasters` scope would be
 * asking for authority we never exercise.
 */
export const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

/** The scope set for a normal Google connection. Unchanged by the GSC work. */
export const GOOGLE_CONNECT_SCOPES = [...IDENTITY_SCOPES, GBP_SCOPE].join(" ");

/**
 * Incremental consent for Search Console.
 *
 * Includes the GBP scope alongside it: Google returns a token carrying only the
 * scopes named in the request, so omitting the existing one would hand back a
 * token that can read Search Console but not reviews. Combined with
 * `include_granted_scopes=true`, this widens the grant instead of replacing it.
 */
export const GOOGLE_SEARCH_CONSOLE_SCOPES = [
    ...IDENTITY_SCOPES,
    GBP_SCOPE,
    SEARCH_CONSOLE_SCOPE,
].join(" ");

/**
 * Whether a stored grant actually carries Search Console access.
 *
 * Google returns granted scopes as a space-delimited string on the token
 * response. Checked by exact membership rather than `includes()` on the raw
 * string: `webmasters.readonly` is a substring of nothing else today, but
 * substring checks on scope strings are how an app convinces itself it has
 * `webmasters` when it only has `webmasters.readonly`.
 */
export function grantIncludesSearchConsole(grantedScopes: string | null | undefined): boolean {
    if (!grantedScopes) return false;
    const scopes = new Set(grantedScopes.split(/\s+/).filter(Boolean));
    // The writable scope implies the readable one, and Google may return either.
    return (
        scopes.has(SEARCH_CONSOLE_SCOPE) ||
        scopes.has("https://www.googleapis.com/auth/webmasters")
    );
}
