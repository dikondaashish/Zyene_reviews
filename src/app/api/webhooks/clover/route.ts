import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { after } from "next/server";
import { getCloverWebhookAuth } from "@/services/clover/config";
import {
    isCloverVerificationPayload,
    parseCloverAppEvents,
    parseCloverPaymentEvents,
    type CloverWebhookPayload,
} from "@/services/clover/webhook-parse";
import { processCloverAppEvent } from "@/services/clover/process-app-event";
import { processCloverPaymentEvent } from "@/services/clover/process-payment-event";

/**
 * POST /api/webhooks/clover
 * Verifies X-Clover-Auth, handles dashboard verification, App + payment events.
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

    if (isCloverVerificationPayload(payload)) {
        logger.info(
            { verificationCode: payload.verificationCode },
            "[clover] webhook verification code received — paste this into Clover dashboard",
        );
        return NextResponse.json({ ok: true, verificationCode: payload.verificationCode });
    }

    if (!expectedAuth) {
        logger.error({}, "[clover] webhook auth secret is not configured");
        return NextResponse.json({ error: "Webhook unavailable" }, { status: 503 });
    }

    if (headerAuth !== expectedAuth) {
        logger.warn({}, "[clover] webhook auth mismatch");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentEvents = parseCloverPaymentEvents(payload);
    const appEvents = parseCloverAppEvents(payload);
    logger.info(
        {
            merchantCount: Object.keys(payload.merchants ?? {}).length,
            paymentEvents: paymentEvents.length,
            appEvents: appEvents.length,
        },
        "[clover] webhook received",
    );

    after(async () => {
        const appTasks = appEvents.map(async (event) => {
            try {
                await processCloverAppEvent(event);
            } catch (err: unknown) {
                logger.error({ err, event }, "[clover] after() app event failed");
            }
        });
        const paymentTasks = paymentEvents.map(async (event) => {
            try {
                await processCloverPaymentEvent(event);
            } catch (err: unknown) {
                logger.error({ err, event }, "[clover] after() payment failed");
            }
        });
        await Promise.all([...appTasks, ...paymentTasks]);
    });

    return NextResponse.json({
        ok: true,
        accepted: paymentEvents.length + appEvents.length,
    });
}
