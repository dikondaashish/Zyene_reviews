import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { decidePosSend, loadPosSendSettings } from "@/lib/review-requests/pos-send-timing";
import { inngest } from "@/services/inngest/client";
import { withGenericWebhookCors } from "./generic-webhook-cors";
import type { GenericWebhookTiming } from "./generic-webhook-timing";

/**
 * Applies the Review Request Settings timing (min transaction + delay) to a
 * generic webhook send. Returns a response when the request was skipped or
 * scheduled, or null when the caller should send immediately.
 */
export async function applyGenericWebhookTiming(args: {
    businessId: string;
    channel: "sms" | "email" | "both";
    contact: { name: string | null; email: string | null; phone: string | null };
    timing: GenericWebhookTiming;
}): Promise<NextResponse | null> {
    const settings = await loadPosSendSettings(createAdminClient(), args.businessId);
    const decision = decidePosSend({
        settings,
        amountCents: args.timing.amountCents,
        delayOverrideMinutes: args.timing.delayOverrideMinutes,
    });

    if (decision.kind === "now") return null;

    if (decision.kind === "skip_min_amount") {
        logger.info(
            { businessId: args.businessId, amountCents: args.timing.amountCents },
            "[generic-webhook] skipped - below minimum transaction amount",
        );
        return withGenericWebhookCors(
            NextResponse.json({
                success: true,
                data: {
                    status: "skipped",
                    reason: "below_minimum_amount",
                    minAmountCents: decision.minAmountCents,
                },
            }),
        );
    }

    await inngest.send({
        name: "review-request/pos.delayed-send",
        data: {
            source: "zapier",
            businessId: args.businessId,
            channel: args.channel,
            contact: args.contact,
            sendAt: decision.sendAt.toISOString(),
        },
    });
    logger.info(
        { businessId: args.businessId, sendAt: decision.sendAt.toISOString() },
        "[generic-webhook] review request scheduled after delay",
    );

    return withGenericWebhookCors(
        NextResponse.json(
            {
                success: true,
                data: {
                    status: "scheduled",
                    channel: args.channel,
                    sendAt: decision.sendAt.toISOString(),
                    delayMinutes: decision.delayMinutes,
                },
            },
            { status: 202 },
        ),
    );
}
