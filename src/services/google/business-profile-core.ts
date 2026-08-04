/** Shared types, endpoints, error shape, and retrying fetch for the GBP APIs. */
import { logger } from "@/lib/logger";

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
        /** v4 REST often uses this name */
        profilePhotoUrl?: string;
        /** Some payloads use Uri instead of Url */
        profilePhotoUri?: string;
    };
    /** Customer-uploaded photos attached to the review (shape can vary by API payload) */
    photos?: Array<{ photoUri?: string; photoUrl?: string; url?: string }>;
    photoUrls?: string[];
    /** Optional rich fields seen in some GBP responses */
    reviewQuestions?: Array<{ question?: string; answer?: string; rating?: string; displayName?: string }>;
    stayDate?: { year?: number; month?: number };
    tripType?: string;
    mealType?: string;
    priceRange?: string;
    details?: Record<string, unknown>;
    starRating: string; // "FIVE", "FOUR", etc.
    comment?: string;
    createTime: string;
    updateTime: string;
    reviewReply?: {
        comment: string;
        updateTime: string;
    };
}

export const BASE_URL_ACCOUNT = "https://mybusinessaccountmanagement.googleapis.com/v1";
export const BASE_URL_INFO = "https://mybusinessbusinessinformation.googleapis.com/v1";
export const BASE_URL_REVIEWS = "https://mybusiness.googleapis.com/v4";

export type GoogleApiError = Error & {
    code?: string;
    statusCode?: number;
    activationUrl?: string;
    userMessage?: string;
};

export function createGoogleApiError(message: string, code?: string): GoogleApiError {
    const error = new Error(message) as GoogleApiError;
    if (code) {
        error.code = code;
    }
    return error;
}

export async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 2000): Promise<Response> {
    try {
        const response = await fetch(url, options);

        if (response.status === 429) {
            if (retries > 0) {
                // Add jitter: delay = random(0, backoff)
                const jitter = Math.random() * backoff;
                logger.error(`[Google API] Rate limit hit (429). Retrying in ${Math.round(jitter)}ms... (Attempts left: ${retries})`);
                await new Promise(resolve => setTimeout(resolve, jitter));
                return fetchWithRetry(url, options, retries - 1, backoff * 2);
            } else {
                logger.error("[Google API] Rate limit exceeded after multiple retries.");
            }
        }

        return response;
    } catch (error) {
        if (retries > 0) {
            const jitter = Math.random() * backoff;
            logger.error(
                { err: error, retriesLeft: retries, delayMs: Math.round(jitter) },
                "[Google API] Fetch failed, retrying",
            );
            await new Promise(resolve => setTimeout(resolve, jitter));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw error;
    }
}

/** Parse `accounts/{accountId}/locations/{locationId}` from a GBP resource name. */
export function parseGoogleLocationResourceIds(locationName: string | null | undefined): {
    googleAccountId: string | null;
    googleLocationId: string | null;
} {
    if (!locationName || typeof locationName !== "string") {
        return { googleAccountId: null, googleLocationId: null };
    }
    const full = locationName.match(/accounts\/([^/]+)\/locations\/([^/]+)/i);
    if (full) {
        return { googleAccountId: full[1], googleLocationId: full[2] };
    }
    const locationOnly = locationName.match(/locations\/([^/]+)/i);
    if (locationOnly) {
        return { googleAccountId: null, googleLocationId: locationOnly[1] };
    }
    return { googleAccountId: null, googleLocationId: null };
}

export function isGoogleUnauthorizedError(error: unknown): boolean {
    const msg = error instanceof Error ? error.message : String(error);
    return /\b401\b/.test(msg) && /unauthorized/i.test(msg);
}
