import { createHmac, timingSafeEqual } from "crypto";

/**
 * Square webhook signature: HMAC-SHA256(notificationUrl + rawBody) → base64,
 * compared to `x-square-hmacsha256-signature`.
 * @see https://developer.squareup.com/docs/webhooks/step3validate
 */
export function verifySquareWebhookSignature(args: {
    rawBody: string;
    signatureHeader: string | null;
    signatureKey: string;
    notificationUrl: string;
}): boolean {
    if (!args.signatureHeader) return false;

    const expected = createHmac("sha256", args.signatureKey)
        .update(args.notificationUrl + args.rawBody)
        .digest("base64");

    try {
        const a = Buffer.from(expected);
        const b = Buffer.from(args.signatureHeader);
        return a.length === b.length && timingSafeEqual(a, b);
    } catch {
        return false;
    }
}
