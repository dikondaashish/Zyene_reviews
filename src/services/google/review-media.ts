import type { GoogleReview } from "@/services/google/business-profile";

/** Normalize actual review photos; video thumbnails must not become photo attachments. */
export function googleReviewPhotoUrls(review: GoogleReview): string[] | null {
    const official = (review.reviewMediaItems ?? [])
        .filter((item) => !item.videoUrl)
        .map((item) => item.thumbnailUrl);
    const legacy = (review.photos ?? []).flatMap((item) => [item.photoUri, item.photoUrl, item.url]);
    const urls = new Set<string>();
    for (const value of [...official, ...legacy, ...(review.photoUrls ?? [])]) {
        if (typeof value !== "string" || !value.trim()) continue;
        const trimmed = value.trim();
        try {
            const url = new URL(trimmed);
            if ((url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password) {
                urls.add(trimmed);
            }
        } catch { /* Ignore malformed provider media URLs. */ }
    }
    return urls.size ? [...urls] : null;
}
