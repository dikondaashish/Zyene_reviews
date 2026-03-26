import { yelpFetch } from "./client";

// ── Yelp API response types ──

interface YelpBusiness {
    id: string;
    name: string;
    image_url: string;
    url: string;
    review_count: number;
    rating: number;
    location: {
        address1: string;
        city: string;
        state: string;
        zip_code: string;
        country: string;
        display_address: string[];
    };
    phone: string;
    display_phone: string;
    categories: { alias: string; title: string }[];
}

interface YelpSearchResponse {
    businesses: YelpBusiness[];
    total: number;
}

interface YelpReview {
    id: string;
    url: string;
    text: string;
    rating: number;
    time_created: string; // "2021-01-01 12:00:00"
    user: {
        id: string;
        profile_url: string;
        image_url: string | null;
        name: string;
    };
}

interface YelpReviewsResponse {
    reviews: YelpReview[];
    total: number;
    possible_languages: string[];
}

// ── Normalized types ──

export interface NormalizedYelpBusiness {
    yelpId: string;
    name: string;
    imageUrl: string;
    yelpUrl: string;
    reviewCount: number;
    rating: number;
    address: string;
    city: string;
    state: string;
    phone: string;
    categories: string[];
}

export interface NormalizedYelpReview {
    externalId: string;
    authorName: string;
    authorAvatarUrl: string | null;
    rating: number;
    content: string;
    publishedAt: string; // ISO string
    externalUrl: string;
}

// ── Adapter methods ──

/**
 * Search for businesses on Yelp by name and location.
 * Returns up to 5 matches for the user to select from.
 */
export async function searchBusiness(
    name: string,
    location: string
): Promise<NormalizedYelpBusiness[]> {
    const data = await yelpFetch<YelpSearchResponse>({
        path: "/businesses/search",
        params: {
            term: name,
            location: location,
            limit: "5",
        },
    });

    return data.businesses.map((biz) => ({
        yelpId: biz.id,
        name: biz.name,
        imageUrl: biz.image_url,
        yelpUrl: biz.url,
        reviewCount: biz.review_count,
        rating: biz.rating,
        address: biz.location.address1 || "",
        city: biz.location.city,
        state: biz.location.state,
        phone: biz.display_phone,
        categories: biz.categories.map((c) => c.title),
    }));
}

/**
 * Get the 3 most recent reviews for a Yelp business.
 * NOTE: Yelp API only returns 3 reviews per call — this is an API limitation.
 */
export async function getReviews(
    yelpBusinessId: string
): Promise<NormalizedYelpReview[]> {
    const data = await yelpFetch<YelpReviewsResponse>({
        path: `/businesses/${yelpBusinessId}/reviews`,
        params: { sort_by: "newest" },
    });

    return data.reviews.map((review) => ({
        externalId: review.id,
        authorName: review.user.name,
        authorAvatarUrl: review.user.image_url,
        rating: review.rating,
        content: review.text,
        publishedAt: new Date(review.time_created).toISOString(),
        externalUrl: review.url,
    }));
}

/**
 * Get business details from Yelp (rating, review count, etc).
 */
export async function getBusiness(
    yelpBusinessId: string
): Promise<NormalizedYelpBusiness> {
    const biz = await yelpFetch<YelpBusiness>({
        path: `/businesses/${yelpBusinessId}`,
    });

    return {
        yelpId: biz.id,
        name: biz.name,
        imageUrl: biz.image_url,
        yelpUrl: biz.url,
        reviewCount: biz.review_count,
        rating: biz.rating,
        address: biz.location.address1 || "",
        city: biz.location.city,
        state: biz.location.state,
        phone: biz.display_phone,
        categories: biz.categories.map((c) => c.title),
    };
}
