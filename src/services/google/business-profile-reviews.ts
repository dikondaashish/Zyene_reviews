/** Review read/reply operations against the v4 My Business API. */
import { logger } from "@/lib/logger";

import {
    BASE_URL_REVIEWS,
    createGoogleApiError,
    fetchWithRetry,
    type GoogleReview,
} from "./business-profile-core";
import { parseGoogleReviewsApiError } from "./business-profile-review-errors";

/** Maps a parsed 403 into the error code callers branch on. */
function forbiddenReviewsError(errorBody: string): Error {
    const parsed = parseGoogleReviewsApiError(errorBody, 403);
    const code =
        parsed.kind === "api_disabled"
            ? "GOOGLE_API_DISABLED"
            : parsed.kind === "gbp_access_pending"
              ? "GOOGLE_GBP_ACCESS_PENDING"
              : "GOOGLE_REVIEWS_FORBIDDEN";

    const err = createGoogleApiError(
        `${code}: ${parsed.userMessage}${parsed.activationUrl ? ` ${parsed.activationUrl}` : ""}`
    );
    err.code = code;
    err.statusCode = 403;
    err.activationUrl = parsed.activationUrl;
    err.userMessage = parsed.userMessage;
    return err;
}

export async function listReviews(
    accessToken: string,
    accountId: string,
    locationId: string,
    pageToken?: string,
    sortByUpdateTime: boolean = true
): Promise<{ reviews: GoogleReview[], averageRating?: number, totalReviewCount?: number, nextPageToken?: string }> {
    // v4 takes `accounts/{accountId}/locations/{locationId}/reviews` with raw ids.
    const params = new URLSearchParams();
    if (sortByUpdateTime) params.set("orderBy", "updateTime desc");
    if (pageToken) params.set("pageToken", pageToken);
    const url = `${BASE_URL_REVIEWS}/accounts/${accountId}/locations/${locationId}/reviews?${params.toString()}`;

    const response = await fetchWithRetry(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`[Google API] List Reviews Error (${response.status}): ${errorBody}`);

        if (response.status === 429) {
            throw createGoogleApiError("Google API Rate Limit Exceeded", "RATE_LIMIT");
        }
        // 403: SERVICE_DISABLED, quota/access, or scope
        if (response.status === 403) {
            throw forbiddenReviewsError(errorBody);
        }
        throw new Error(`Failed to list reviews: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    return {
        reviews: data.reviews || [],
        averageRating: data.averageRating,
        totalReviewCount: data.totalReviewCount,
        nextPageToken: data.nextPageToken
    };
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

export async function deleteReviewReply(
    accessToken: string,
    accountId: string,
    locationId: string,
    reviewId: string
): Promise<void> {
    const url = `${BASE_URL_REVIEWS}/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`;

    const response = await fetchWithRetry(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(
            `Failed to delete review reply: ${response.status} ${response.statusText}${body ? ` — ${body}` : ""}`
        );
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
            throw createGoogleApiError("Google API Rate Limit Exceeded", "RATE_LIMIT");
        }
        const errorBody = await response.text();
        throw new Error(`Failed to get review (${response.status}): ${errorBody}`);
    }

    return response.json();
}
