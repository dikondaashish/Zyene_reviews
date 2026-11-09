import { graphFetch } from "./client";
import type { FacebookReview, FacebookReviewsResponse, NormalizedFacebookReview } from "./adapter";

/** First page keeps today's size; that page alone is analyzed and alerted on. */
const FIRST_PAGE_SIZE = 50;
const OLDER_PAGE_SIZE = 100;
/** Hard stop for very large pages: 50 + 39 × 100 ≈ 4,000 ratings per sync. */
export const MAX_FACEBOOK_REVIEW_PAGES = 40;

function normalizeFacebookReview(review: FacebookReview): NormalizedFacebookReview {
    // Determine rating: use legacy star rating if available,
    // otherwise map recommendation_type
    let rating = 3; // Default neutral
    if (review.rating) {
        rating = review.rating;
    } else if (review.recommendation_type === "positive") {
        rating = 5;
    } else if (review.recommendation_type === "negative") {
        rating = 1;
    }

    // Use open_graph_story ID as external_id, fallback to reviewer+timestamp
    const externalId =
        review.open_graph_story?.id ||
        `${review.reviewer.id}_${review.created_time}`;

    return {
        externalId,
        authorName: review.reviewer.name,
        rating,
        content: review.review_text || "",
        publishedAt: new Date(review.created_time).toISOString(),
    };
}

/**
 * Get reviews (ratings/recommendations) for a Facebook page, following
 * `paging.cursors.after` so pages with more than one page of ratings are fully
 * imported (the API returns at most one page per call).
 *
 * `recent` is the newest page, `older` everything after it.
 *
 * Facebook uses "recommendations" (thumbs up/down) not star ratings.
 * - recommendation_type = "positive" → rating 5
 * - recommendation_type = "negative" → rating 1
 * - Legacy star ratings (1-5) are used if available
 */
export async function getReviews(
    pageId: string,
    pageAccessToken: string
): Promise<{ recent: NormalizedFacebookReview[]; older: NormalizedFacebookReview[]; truncated: boolean }> {
    const fields = "created_time,reviewer,recommendation_type,review_text,rating,open_graph_story";
    const recent: NormalizedFacebookReview[] = [];
    const older: NormalizedFacebookReview[] = [];
    let after: string | undefined;

    for (let page = 0; page < MAX_FACEBOOK_REVIEW_PAGES; page++) {
        const data = await graphFetch<FacebookReviewsResponse>({
            path: `/${pageId}/ratings`,
            params: {
                access_token: pageAccessToken,
                fields,
                limit: String(page === 0 ? FIRST_PAGE_SIZE : OLDER_PAGE_SIZE),
                ...(after ? { after } : {}),
            },
        });
        (page === 0 ? recent : older).push(...(data.data ?? []).map(normalizeFacebookReview));

        const nextAfter = data.paging?.next ? data.paging.cursors?.after : undefined;
        if (!nextAfter || nextAfter === after || !data.data?.length) {
            return { recent, older, truncated: false };
        }
        after = nextAfter;
    }
    return { recent, older, truncated: true };
}
