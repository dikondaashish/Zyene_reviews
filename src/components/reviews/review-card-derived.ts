import type { Review } from "@/components/reviews/review-card-types";

export function getReviewDisplayContent(review: Review): string {
    return review.text || review.content || "";
}

export function getReviewAvatarUrl(review: Review): string | null {
    return typeof review.author_avatar_url === "string" && review.author_avatar_url.trim()
        ? review.author_avatar_url.trim()
        : null;
}

export function getReviewAuthorInitial(review: Review): string {
    return (review.author_name || "A").charAt(0);
}

export function getReviewGooglePhotos(review: Review): string[] {
    return (review.review_photo_urls || []).filter(Boolean);
}

export function getReviewGoogleAttributeChips(review: Review): string[] {
    return (review.google_attribute_chips || []).filter(Boolean);
}

export function getReviewGooglePlaceContext(review: Review): string[] {
    return (review.google_place_context || []).filter(Boolean);
}

export function getReviewGoogleMapsHref(
    review: Review,
    googleMapsListingUrl: string | null | undefined
): string | null {
    return review.platform === "google" &&
        typeof googleMapsListingUrl === "string" &&
        googleMapsListingUrl.trim().length > 0
        ? googleMapsListingUrl.trim()
        : null;
}
