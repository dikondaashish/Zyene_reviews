import { signedReviewLink } from "@/lib/review-requests/tracking-token";

/** Public review page base URL for a business slug (capture domain in prod, root domain locally). */
export function reviewCaptureBaseUrl(slug: string): string {
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const isLocal = rootDomain.includes("localhost");
    const protocol = isLocal ? "http" : "https";
    // Locally there is no capture domain: the review page is served at /r/<slug>.
    if (isLocal) return `${protocol}://${rootDomain}/r/${slug}`;
    const captureDomain = process.env.NEXT_PUBLIC_REVIEW_CAPTURE_DOMAIN || "collectratings.com";
    return `${protocol}://${captureDomain}/${slug}`;
}

/** Signed per-request review link, so opens/clicks are attributed to `requestId`. */
export function signedReviewCaptureLink(slug: string, requestId: string, businessId: string): string {
    return signedReviewLink(reviewCaptureBaseUrl(slug), requestId, businessId);
}
