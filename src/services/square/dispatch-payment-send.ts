import { logger } from "@/lib/logger";
import type { createAdminClient } from "@/lib/db/supabase/admin";
import {
    decidePosSend,
    formatCents,
    loadPosSendSettings,
} from "@/lib/review-requests/pos-send-timing";
import { inngest } from "@/services/inngest/client";
import { claimSquarePaymentSend } from "@/services/square/claim-send";
import { patchSquarePaymentEvent } from "@/services/square/payment-event-store";
import type { SquareResolvedContact } from "@/services/square/resolve-contact";
import {
    sendSquareReviewRequest,
    squareStatusFromSendOutcome,
} from "@/services/square/send-from-payment";
import type { ParsedSquarePaymentEvent } from "@/services/square/webhook-parse";

type Admin = ReturnType<typeof createAdminClient>;
type PaymentRef = Pick<ParsedSquarePaymentEvent, "merchantId" | "paymentId">;

export type SquareSendConnection = {
    business_id: string;
    auto_send_enabled: boolean;
    environment: string;
};

/**
 * After the contact is resolved: apply the business min-transaction and delay
 * settings, claim the row, then send now or hand off to the delayed Inngest job.
 * The row stays `sending` while a delayed send is pending so payment.updated
 * cannot claim it twice.
 */
export async function dispatchSquarePaymentSend(args: {
    admin: Admin;
    event: PaymentRef;
    connection: SquareSendConnection;
    contact: SquareResolvedContact;
    amountCents: number | null;
}): Promise<void> {
    const { admin, event, connection } = args;
    const settings = await loadPosSendSettings(admin, connection.business_id);
    const decision = decidePosSend({ settings, amountCents: args.amountCents });

    if (connection.auto_send_enabled && decision.kind === "skip_min_amount") {
        await patchSquarePaymentEvent(admin, event, {
            status: "skipped_guard",
            error_message: `Below minimum transaction amount (${formatCents(decision.minAmountCents)}).`,
        });
        logger.info(
            { paymentId: event.paymentId, amountCents: args.amountCents, minAmountCents: decision.minAmountCents },
            "[square] skipped - below minimum transaction amount",
        );
        return;
    }

    if (!(await claimSquarePaymentSend(admin, event.merchantId, event.paymentId))) {
        logger.info({ paymentId: event.paymentId }, "[square] send claim lost - skip duplicate");
        return;
    }

    if (connection.auto_send_enabled && decision.kind === "later") {
        await inngest.send({
            id: `square-review-request:${event.merchantId}:${event.paymentId}`,
            name: "review-request/pos.delayed-send",
            data: {
                source: "square",
                businessId: connection.business_id,
                merchantId: event.merchantId,
                paymentId: event.paymentId,
                sendAt: decision.sendAt.toISOString(),
            },
        });
        logger.info(
            { paymentId: event.paymentId, sendAt: decision.sendAt.toISOString(), delayMinutes: decision.delayMinutes },
            "[square] review request scheduled after delay",
        );
        return;
    }

    await sendAndRecordSquarePayment({
        admin,
        event,
        businessId: connection.business_id,
        autoSendEnabled: connection.auto_send_enabled,
        environment: connection.environment,
        contact: args.contact,
    });
}

/** Sends via sendOutboundReviewRequest (cap + opt-out guards) and records the outcome. */
export async function sendAndRecordSquarePayment(args: {
    admin: Admin;
    event: PaymentRef;
    businessId: string;
    autoSendEnabled: boolean;
    environment: string;
    contact: SquareResolvedContact;
}): Promise<string> {
    const { admin, event } = args;
    const sendOutcome = await sendSquareReviewRequest({
        businessId: args.businessId,
        autoSendEnabled: args.autoSendEnabled,
        environment: args.environment,
        contact: args.contact,
    });

    const status = squareStatusFromSendOutcome(sendOutcome);
    const patch: Record<string, unknown> = { status };
    if (sendOutcome.kind === "sent") patch.review_request_id = sendOutcome.requestId;
    if (sendOutcome.kind === "skipped_guard" || sendOutcome.kind === "send_failed") {
        patch.error_message = sendOutcome.message.slice(0, 500);
    }
    await patchSquarePaymentEvent(admin, event, patch);

    logger.info(
        {
            businessId: args.businessId,
            merchantId: event.merchantId,
            paymentId: event.paymentId,
            status,
            requestId: sendOutcome.kind === "sent" ? sendOutcome.requestId : null,
        },
        "[square] Phase2 payment processed",
    );
    return status;
}
