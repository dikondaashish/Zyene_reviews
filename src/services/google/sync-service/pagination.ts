/** Google review sync — pagination */

import {
  listReviews,
  type GoogleReview,
} from "../business-profile";
import {
  MAX_REVIEW_PAGES,
  PAGINATION_DELAY_MS,
  REQUEST_SMOOTHING_DELAY_MS,
} from "../constants";
import { isOrderByUnsupportedError } from "./helpers";

export async function fetchGoogleReviewsPaginated(
    accessToken: string,
    googleAccountId: string,
    googleLocationId: string
): Promise<{
    googleReviews: GoogleReview[];
    apiTotalReviews?: number;
    apiAverageRating?: number;
    /** True when more pages existed but we stopped at {@link MAX_REVIEW_PAGES} — list is incomplete for reconciliation. */
    truncated: boolean;
}> {
    let pageToken: string | undefined = undefined;
    const googleReviews: GoogleReview[] = [];
    let apiTotalReviews: number | undefined = undefined;
    let apiAverageRating: number | undefined = undefined;
    let pageCount = 0;
    let sortByUpdateTime = true;

    do {
        let apiResp;
        try {
            apiResp = await listReviews(
                accessToken,
                googleAccountId,
                googleLocationId,
                pageToken,
                sortByUpdateTime
            );
        } catch (error) {
            if (!sortByUpdateTime || !isOrderByUnsupportedError(error)) {
                throw error;
            }
            console.error(
                `[Sync] Full-sync fallback: orderBy=updateTime desc unsupported for account ${googleAccountId}/location ${googleLocationId}.`
            );
            sortByUpdateTime = false;
            apiResp = await listReviews(
                accessToken,
                googleAccountId,
                googleLocationId,
                pageToken,
                false
            );
        }
        googleReviews.push(...apiResp.reviews);

        // Capture totals from first page payload only.
        if (pageCount === 0) {
            apiTotalReviews = apiResp.totalReviewCount;
            apiAverageRating = apiResp.averageRating;
        }

        pageToken = apiResp.nextPageToken;
        pageCount++;

        if (pageToken && pageCount < MAX_REVIEW_PAGES) {
            await new Promise((resolve) => setTimeout(resolve, PAGINATION_DELAY_MS));
        }
    } while (pageToken && pageCount < MAX_REVIEW_PAGES);

    const truncated = Boolean(pageToken);
    return { googleReviews, apiTotalReviews, apiAverageRating, truncated };
}

