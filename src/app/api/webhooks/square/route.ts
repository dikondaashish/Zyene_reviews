import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { after } from "next/server";
import {
    getSquareWebhookNotificationUrl,
    getSquareWebhookSignatureKey,
} from "@/services/square/config";
import { verifySquareWebhookSignature } from "@/services/square/verify-signature";
import { parseSquareWebhook, type SquareWebhookPayload } from "@/services/square/webhook-parse";
import { processSquarePaymentEvent } from "@/services/square/process-payment-event";
import { processSquareRevokeEvent } from "@/services/square/process-revoke-event";

/**
 * POST /api/webhooks/square
 * Verifies HMAC signature, accepts payment.created + oauth revoke.
 */
export async function POST(request: Request) {
    const signatureKey = getSquareWebhookSignatureKey();
    const rawBody = await request.text();
    const signatureHeader = request.headers.get("x-square-hmacsha256-signature");

    if (signatureKey) {
        const ok = verifySquareWebhookSignature({
            rawBody,
            signatureHeader,
            signatureKey,
            notificationUrl: getSquareWebhookNotificationUrl(),
        });
        if (!ok) {
            logger.warn({}, "[square] webhook signature mismatch");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    } else {
        logger.warn({}, "[square] SQUARE_WEBHOOK_SIGNATURE_KEY unset — skipping verify (dev only)");
    }

    let payload: SquareWebhookPayload;
    try {
        payload = JSON.parse(rawBody) as SquareWebhookPayload;
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { payment, revoke } = parseSquareWebhook(payload);
    logger.info(
        {
            type: payload.type,
            merchantId: payload.merchant_id,
            hasPayment: Boolean(payment),
            hasRevoke: Boolean(revoke),
        },
        "[square] webhook received",
    );

    after(async () => {
        if (revoke) {
            try {
                await processSquareRevokeEvent(revoke);
            } catch (err: unknown) {
                logger.error({ err, revoke }, "[square] after() revoke failed");
            }
        }
        if (payment) {
            try {
                await processSquarePaymentEvent(payment);
            } catch (err: unknown) {
                logger.error({ err, payment }, "[square] after() payment failed");
            }
        }
    });

    return NextResponse.json({
        ok: true,
        accepted: (payment ? 1 : 0) + (revoke ? 1 : 0),
    });
}
