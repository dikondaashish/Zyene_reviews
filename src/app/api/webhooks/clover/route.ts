import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { after } from "next/server";
import { getCloverWebhookAuth } from "@/services/clover/config";
import {
    isCloverVerificationPayload,
    parseCloverPaymentEvents,
    type CloverWebhookPayload,
} from "@/services/clover/webhook-parse";
import { processCloverPaymentEvent } from "@/services/clover/process-payment-event";

/**
 * POST /api/webhooks/clover
 * Verifies X-Clover-Auth, handles dashboard verification, processes payment events.
 * Phase 1: resolves contact and logs — does not send review requests.
 */
export async function POST(request: Request) {
    const expectedAuth = getCloverWebhookAuth();
    const headerAuth = request.headers.get("x-clover-auth");

    let payload: CloverWebhookPayload;
    try {
        payload = (await request.json()) as CloverWebhookPayload;
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Dashboard verification (no auth header yet)
    if (isCloverVerificationPayload(payload)) {
        logger.info(
            { verificationCode: payload.verificationCode },
            "[clover] webhook verification code received — paste this into Clover dashboard",
        );
        return NextResponse.json({ ok: true, verificationCode: payload.verificationCode });
    }

    if (expectedAuth && headerAuth !== expectedAuth) {
        logger.warn({}, "[clover] webhook auth mismatch");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = parseCloverPaymentEvents(payload);
    logger.info(
        { merchantCount: Object.keys(payload.merchants ?? {}).length, paymentEvents: events.length },
        "[clover] webhook received",
    );

    // Process after response so Clover gets 200 quickly
    after(async () => {
        for (const event of events) {
            try {
                await processCloverPaymentEvent(event);
            } catch (err: unknown) {
                logger.error({ err, event }, "[clover] after() payment failed");
            }
        }
    });

    return NextResponse.json({ ok: true, accepted: events.length });
}
