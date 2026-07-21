import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { fetchSquarePayment } from "@/services/square/api-client";
import { claimSquarePaymentSend } from "@/services/square/claim-send";
import { getSquareEnvironment } from "@/services/square/config";
import { decryptSquareAccessToken } from "@/services/square/decrypt-access-token";
import {
    findSquarePaymentEvent,
    insertSquarePaymentEvent,
    patchSquarePaymentEvent,
    resolveSquareContactViaCustomerId,
} from "@/services/square/payment-event-store";
import { resolveContactFromSquarePayment } from "@/services/square/resolve-contact";
import {
    sendSquareReviewRequest,
    squareStatusFromSendOutcome,
} from "@/services/square/send-from-payment";
import type { ParsedSquarePaymentEvent } from "@/services/square/webhook-parse";

/** Phase 2: resolve contact, then send when auto_send_enabled. */
export async function processSquarePaymentEvent(event: ParsedSquarePaymentEvent): Promise<void> {
    const admin = createAdminClient();
    const env = getSquareEnvironment();
    const isCreate = event.eventType === "payment.created";
    const isUpdate = event.eventType === "payment.updated";
    if (!isCreate && !isUpdate) return;

    const { data: connection, error: connError } = await admin
        .from("square_connections")
        .select(
            "id, business_id, merchant_id, environment, auto_send_enabled, access_token_encrypted, refresh_token_encrypted, access_token_expires_at",
        )
        .eq("merchant_id", event.merchantId)
        .eq("environment", env)
        .is("disconnected_at", null)
        .maybeSingle();

    if (connError || !connection) {
        logger.warn(
            { merchantId: event.merchantId, paymentId: event.paymentId },
            "[square] payment event for unknown or disconnected merchant — ignore",
        );
        return;
    }

    const existing = await findSquarePaymentEvent(admin, event.merchantId, event.paymentId);

    if (isCreate) {
        if (existing) {
            logger.info({ paymentId: event.paymentId }, "[square] duplicate payment.created skipped");
            return;
        }
        if (!(await insertSquarePaymentEvent(admin, {
            businessId: connection.business_id,
            merchantId: event.merchantId,
            paymentId: event.paymentId,
            eventType: event.eventType,
        }))) {
            return;
        }
    } else if (!existing) {
        logger.info({ paymentId: event.paymentId }, "[square] payment.updated with no prior row — ignore");
        return;
    } else if (
        existing.review_request_id ||
        existing.status === "sent" ||
        existing.status === "sending"
    ) {
        logger.info({ paymentId: event.paymentId }, "[square] payment already claimed/sent — ignore");
        return;
    } else if (existing.customer_email || existing.customer_phone) {
        logger.info({ paymentId: event.paymentId }, "[square] payment.updated contact already set — ignore");
        return;
    }

    try {
        const accessToken = await decryptSquareAccessToken(admin, connection);
        const payment = await fetchSquarePayment({
            paymentId: event.paymentId,
            accessToken,
        });

        let contact = resolveContactFromSquarePayment(payment);
        if (!contact.email && !contact.phone) {
            contact = await resolveSquareContactViaCustomerId({ payment, accessToken });
        }

        if (!contact.email && !contact.phone) {
            await patchSquarePaymentEvent(admin, event, {
                status: "skipped_no_contact",
                customer_email: null,
                customer_phone: null,
                customer_name: contact.name,
            });
            logger.info({ paymentId: event.paymentId }, "[square] Phase2 skipped — no contact");
            return;
        }

        await patchSquarePaymentEvent(admin, event, {
            customer_email: contact.email,
            customer_phone: contact.phone,
            customer_name: contact.name,
        });

        if (!(await claimSquarePaymentSend(admin, event.merchantId, event.paymentId))) {
            logger.info({ paymentId: event.paymentId }, "[square] send claim lost — skip duplicate");
            return;
        }

        const sendOutcome = await sendSquareReviewRequest({
            businessId: connection.business_id,
            autoSendEnabled: connection.auto_send_enabled,
            environment: connection.environment,
            contact,
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
                businessId: connection.business_id,
                merchantId: event.merchantId,
                paymentId: event.paymentId,
                eventType: event.eventType,
                status,
                requestId: sendOutcome.kind === "sent" ? sendOutcome.requestId : null,
            },
            "[square] Phase2 payment processed",
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "unknown error";
        await patchSquarePaymentEvent(admin, event, {
            status: "error",
            error_message: message.slice(0, 500),
        });
        logger.error(
            { err, paymentId: event.paymentId, merchantId: event.merchantId },
            "[square] payment processing failed",
        );
    }
}
