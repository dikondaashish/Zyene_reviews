
export interface GoogleTokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
}

export interface GoogleAccount {
    name: string; // accounts/{accountId}
    accountName: string;
    type: string;
    verificationState: string;
    vettedState: string;
}

export interface GoogleLocation {
    name: string; // locations/{locationId} or accounts/{accountId}/locations/{locationId}
    title: string;
    storeCode?: string;
    metadata?: {
        mapsUri?: string;
        newReviewUri?: string;
        placeId?: string;
    };
}


export interface GoogleReview {
    reviewId: string;
    reviewer: {
        displayName: string;
        profilePhotoUrl?: string;
    };
    starRating: string; // "FIVE", "FOUR", etc.
    comment?: string;
    createTime: string;
    updateTime: string;
    reviewReply?: {
        comment: string;
        updateTime: string;
    };
}

const BASE_URL_ACCOUNT = "https://mybusinessaccountmanagement.googleapis.com/v1";
const BASE_URL_INFO = "https://mybusinessbusinessinformation.googleapis.com/v1";
const BASE_URL_REVIEWS = "https://mybusiness.googleapis.com/v4";

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 2000): Promise<Response> {
    try {
        const response = await fetch(url, options);

        if (response.status === 429) {
            if (retries > 0) {
                // Add jitter: delay = random(0, backoff)
                const jitter = Math.random() * backoff;
                console.warn(`[Google API] Rate limit hit (429). Retrying in ${Math.round(jitter)}ms... (Attempts left: ${retries})`);
                await new Promise(resolve => setTimeout(resolve, jitter));
                return fetchWithRetry(url, options, retries - 1, backoff * 2);
            } else {
                console.error("[Google API] Rate limit exceeded after multiple retries.");
            }
        }

        return response;
    } catch (error) {
        if (retries > 0) {
            const jitter = Math.random() * backoff;
            console.warn(`[Google API] Fetch failed. Retrying in ${Math.round(jitter)}ms... (Attempts left: ${retries})`, error);
            await new Promise(resolve => setTimeout(resolve, jitter));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw error;
    }
}

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

    const response = await fetch("https://oauth2.googleapis.com/token", {
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
        console.error(`[Token] Google Refresh Error (${response.status}): ${errorBody}`);
        throw new Error(`Failed to refresh token: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    return response.json();
}

export async function listAccounts(accessToken: string): Promise<GoogleAccount[]> {
    const response = await fetchWithRetry(`${BASE_URL_ACCOUNT}/accounts`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        if (response.status === 429) {
            const error: any = new Error("Google API Rate Limit Exceeded");
            error.code = 'RATE_LIMIT';
            throw error;
        }
        throw new Error(`Failed to list accounts: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.accounts || [];
}


export async function listLocations(accessToken: string, accountName: string): Promise<GoogleLocation[]> {
    // accountName format: accounts/{accountId}
    const response = await fetchWithRetry(`${BASE_URL_INFO}/${accountName}/locations?readMask=name,title,storeCode,metadata`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        if (response.status === 429) {
            const error: any = new Error("Google API Rate Limit Exceeded");
            error.code = 'RATE_LIMIT';
            throw error;
        }
        throw new Error(`Failed to list locations: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.locations || [];
}

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

export async function listReviews(accessToken: string, accountId: string, locationId: string): Promise<GoogleReview[]> {
    // URL: https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews
    // Note: accountId and locationId are raw IDs, not "accounts/{id}"
    // But listLocations returns "locations/{locationId}" or "accounts/{accountId}/locations/{locationId}"?
    // We need to parse.
    // Actually, v4 API takes `accounts/{accountId}/locations/{locationId}/reviews` as PATH.
    // Let's verify format.

    const url = `${BASE_URL_REVIEWS}/accounts/${accountId}/locations/${locationId}/reviews`;

    const response = await fetchWithRetry(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[Google API] List Reviews Error (${response.status}): ${errorBody}`);

        if (response.status === 429) {
            const error: any = new Error("Google API Rate Limit Exceeded");
            error.code = "RATE_LIMIT";
            throw error;
        }
        // 403: SERVICE_DISABLED, quota/access, or scope
        if (response.status === 403) {
            const parsed = parseGoogleReviewsApiError(errorBody, 403);
            const code =
                parsed.kind === "api_disabled"
                    ? "GOOGLE_API_DISABLED"
                    : parsed.kind === "gbp_access_pending"
                      ? "GOOGLE_GBP_ACCESS_PENDING"
                      : "GOOGLE_REVIEWS_FORBIDDEN";
            const err: any = new Error(
                `${code}: ${parsed.userMessage}${parsed.activationUrl ? ` ${parsed.activationUrl}` : ""}`
            );
            err.code = code;
            err.statusCode = 403;
            err.activationUrl = parsed.activationUrl;
            err.userMessage = parsed.userMessage;
            throw err;
        }
        throw new Error(`Failed to list reviews: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    return data.reviews || [];
}

export async function replyToReview(
    accessToken: string,
    accountId: string,
    locationId: string,
    reviewId: string,
    text: string
): Promise<void> {
    const url = `${BASE_URL_REVIEWS}/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`;

    const response = await fetchWithRetry(url, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: text }),
    });

    if (!response.ok) {
        throw new Error(`Failed to reply to review: ${response.status} ${response.statusText}`);
    }
}

/**
 * Fetches a single review by its resource name.
 * @param accessToken Valid Google access token
 * @param reviewName Format: accounts/{accountId}/locations/{locationId}/reviews/{reviewId}
 */
export async function getReview(accessToken: string, reviewName: string): Promise<GoogleReview> {
    const url = `${BASE_URL_REVIEWS}/${reviewName}`;

    const response = await fetchWithRetry(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        if (response.status === 429) {
            const error: any = new Error("Google API Rate Limit Exceeded");
            error.code = 'RATE_LIMIT';
            throw error;
        }
        const errorBody = await response.text();
        throw new Error(`Failed to get review (${response.status}): ${errorBody}`);
    }

    return response.json();
}
