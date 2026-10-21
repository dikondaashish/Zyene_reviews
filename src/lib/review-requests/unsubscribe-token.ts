import { createHmac, timingSafeEqual } from "node:crypto";
import { getMarketingSiteOrigin } from "@/lib/seo/marketing-site-url";

/**
 * Signed review-request email unsubscribe tokens. The URL carries only the request id
 * and an HMAC (no email address); the server resolves business + recipient from the row.
 * Purpose-prefixed so a tracking signature can never be replayed as an unsubscribe.
 */
function secret(): string {
    const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!value) throw new Error("Unsubscribe links are not configured");
    return value;
}

export function signUnsubscribe(requestId: string, businessId: string): string {
    return createHmac("sha256", secret()).update(`review-unsubscribe:v1:${requestId}:${businessId}`).digest("base64url");
}

export function verifyUnsubscribe(requestId: string, businessId: string, token: string | null | undefined): boolean {
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return false;
    const supplied = Buffer.from(token, "base64url");
    const expected = Buffer.from(signUnsubscribe(requestId, businessId), "base64url");
    return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

/** Unsubscribe endpoint: GET shows the confirm page, POST (form or RFC 8058 one-click) applies it. */
export function unsubscribeUrl(requestId: string, businessId: string): string {
    const url = new URL(`${getMarketingSiteOrigin()}/api/review-requests/unsubscribe`);
    url.searchParams.set("ref", requestId);
    url.searchParams.set("sig", signUnsubscribe(requestId, businessId));
    return url.toString();
}
