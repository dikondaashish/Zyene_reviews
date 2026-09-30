import { createHmac, timingSafeEqual } from "node:crypto";

function trackingSecret(): string {
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret) throw new Error("Review tracking is not configured");
    return secret;
}

export function signReviewTracking(requestId: string, businessId: string): string {
    return createHmac("sha256", trackingSecret())
        .update(`review-tracking:v1:${requestId}:${businessId}`)
        .digest("base64url");
}

export function verifyReviewTracking(
    requestId: string,
    businessId: string,
    token: string | null | undefined,
): boolean {
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return false;
    const supplied = Buffer.from(token, "base64url");
    const expected = Buffer.from(signReviewTracking(requestId, businessId), "base64url");
    return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export function signedReviewLink(baseUrl: string, requestId: string, businessId: string): string {
    const url = new URL(baseUrl);
    url.searchParams.set("ref", requestId);
    url.searchParams.set("sig", signReviewTracking(requestId, businessId));
    return url.toString();
}
