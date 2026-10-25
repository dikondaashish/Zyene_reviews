import { signedReviewLink } from "@/lib/review-requests/tracking-token";
import { reviewCaptureBaseUrl } from "@/lib/review-requests/review-capture-base";

export { reviewCaptureBaseUrl };

/** Signed per-request review link, so opens/clicks are attributed to `requestId`. */
export function signedReviewCaptureLink(slug: string, requestId: string, businessId: string): string {
    return signedReviewLink(reviewCaptureBaseUrl(slug), requestId, businessId);
}
