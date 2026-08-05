/**
 * Interprets Google's 403/429 error payloads for review sync.
 *
 * Google returns the same HTTP status for "you never enabled the API" and
 * "your GBP access request is still pending", which need very different user
 * messaging — hence the parsing.
 */

const GBP_PREREQS_URL = "https://developers.google.com/my-business/content/prereqs";

/** Parse Google API error JSON for reviews sync (403/429). */
export function parseGoogleReviewsApiError(errorBody: string, httpStatus: number): {
    kind: "api_disabled" | "gbp_access_pending" | "other";
    userMessage: string;
    activationUrl?: string;
} {
    try {
        const j = JSON.parse(errorBody) as {
            error?: { message?: string; details?: Array<{ reason?: string; metadata?: Record<string, string> }> };
        };
        const msg = j?.error?.message ?? "";
        const details = j?.error?.details ?? [];
        const disabled =
            details.some((d) => d.reason === "SERVICE_DISABLED") ||
            /not been used|is disabled|SERVICE_DISABLED/i.test(msg);

        if (disabled) {
            const activationUrl = details.find((d) => d.metadata?.activationUrl)?.metadata?.activationUrl;
            return {
                kind: "api_disabled",
                userMessage:
                    "Enable the Google My Business API (mybusiness.googleapis.com) on this project using the link below, " +
                    "and also enable My Business Account Management + Business Information APIs. Wait 2–5 minutes, then try Sync again.",
                activationUrl,
            };
        }

        // Quota 0 / GBP formal access — after APIs are enabled but Google still blocks
        const gbpAccess =
            /quota of 0|quota.*exhausted|RESOURCE_EXHAUSTED|request for GBP|GBP API access|Business Profile API access|prerequisite|not been granted|additional access required/i.test(
                msg
            ) || details.some((d) => d.reason === "RESOURCE_EXHAUSTED");
        if (gbpAccess && httpStatus === 403) {
            return {
                kind: "gbp_access_pending",
                userMessage:
                    "Google may require Business Profile API access approval or a non-zero quota (common with the split My Business APIs). " +
                    `Apply here: ${GBP_PREREQS_URL} — approval can take days to weeks.`,
            };
        }
    } catch {
        /* not JSON */
    }
    return {
        kind: "other",
        userMessage:
            "Google denied access to reviews. Enable Google My Business API + Account Management + Business Information APIs. " +
            "Grant business.manage scope and reconnect Google from Integrations. " +
            `If quota stays 0, request GBP access: ${GBP_PREREQS_URL}`,
    };
}

/** @deprecated use parseGoogleReviewsApiError */
export function parseGoogle403Error(errorBody: string) {
    return parseGoogleReviewsApiError(errorBody, 403);
}
