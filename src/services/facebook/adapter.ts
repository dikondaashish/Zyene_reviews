import { graphFetch } from "./client";

export { getReviews, MAX_FACEBOOK_REVIEW_PAGES } from "./reviews-fetch";

// ── Facebook API response types ──

interface FacebookPage {
    id: string;
    name: string;
    access_token: string;
    category: string;
    category_list?: { id: string; name: string }[];
}

interface FacebookPagesResponse {
    data: FacebookPage[];
    paging?: { cursors: { before: string; after: string }; next?: string };
}

export interface FacebookReview {
    created_time: string; // ISO 8601
    reviewer: {
        id: string;
        name: string;
    };
    recommendation_type?: "positive" | "negative"; // New recommendations system
    review_text?: string;
    rating?: number; // Legacy star rating (1-5), may not be present
    open_graph_story?: {
        id: string;
    };
}

export interface FacebookReviewsResponse {
    data: FacebookReview[];
    paging?: { cursors: { before: string; after: string }; next?: string };
}

// ── Normalized types ──

export interface NormalizedFacebookPage {
    pageId: string;
    pageName: string;
    pageAccessToken: string;
    category: string;
}

export interface NormalizedFacebookReview {
    externalId: string;
    authorName: string;
    rating: number;
    content: string;
    publishedAt: string; // ISO string
}

// ── Adapter methods ──

/**
 * Get all Facebook pages managed by the authenticated user.
 */
export async function getPages(
    userAccessToken: string
): Promise<NormalizedFacebookPage[]> {
    const data = await graphFetch<FacebookPagesResponse>({
        path: "/me/accounts",
        params: {
            access_token: userAccessToken,
            fields: "id,name,access_token,category",
        },
    });

    return data.data.map((page) => ({
        pageId: page.id,
        pageName: page.name,
        pageAccessToken: page.access_token,
        category: page.category,
    }));
}

/**
 * Get reviews (ratings/recommendations) for a Facebook page.
 *
 * Facebook uses "recommendations" (thumbs up/down) not star ratings.
 * - recommendation_type = "positive" → rating 5
 * - recommendation_type = "negative" → rating 1
 * - Legacy star ratings (1-5) are used if available
 */
/**
 * Reply to a Facebook review by posting a comment on it.
 */
export async function replyToReview(
    reviewId: string,
    pageAccessToken: string,
    message: string
): Promise<{ id: string }> {
    return graphFetch<{ id: string }>({
        path: `/${reviewId}/comments`,
        method: "POST",
        params: {
            access_token: pageAccessToken,
        },
        body: { message },
    });
}

/**
 * Get page details including ratings summary.
 */
export async function getPageDetails(
    pageId: string,
    pageAccessToken: string
): Promise<{
    name: string;
    overallStarRating: number;
    ratingCount: number;
    link: string;
}> {
    const data = await graphFetch<{
        name: string;
        overall_star_rating?: number;
        rating_count?: number;
        link?: string;
    }>({
        path: `/${pageId}`,
        params: {
            access_token: pageAccessToken,
            fields: "name,overall_star_rating,rating_count,link",
        },
    });

    return {
        name: data.name,
        overallStarRating: data.overall_star_rating || 0,
        ratingCount: data.rating_count || 0,
        link: data.link || `https://facebook.com/${pageId}`,
    };
}
