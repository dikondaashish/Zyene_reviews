import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { fetchSquareCustomer, fetchSquarePayment } from "@/services/square/api-client";
import { getSquareEnvironment } from "@/services/square/config";
import { decryptSquareAccessToken } from "@/services/square/decrypt-access-token";
import {
    extractSquareCustomerId,
    resolveContactFromSquareCustomer,
    resolveContactFromSquarePayment,
    type SquareResolvedContact,
} from "@/services/square/resolve-contact";
import {
    sendSquareReviewRequest,
    squareStatusFromSendOutcome,
} from "@/services/square/send-from-payment";
import type { ParsedSquarePaymentEvent } from "@/services/square/webhook-parse";

type Admin = ReturnType<typeof createAdminClient>;

type ExistingEvent = {
    id: string;
    status: string;
    customer_email: string | null;
    customer_phone: string | null;
    review_request_id: string | null;
};

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

    const existing = await findExistingEvent(admin, event.merchantId, event.paymentId);

    if (isCreate) {
        if (existing) {
            logger.info({ paymentId: event.paymentId }, "[square] duplicate payment.created skipped");
            return;
        }
        if (!(await insertEvent(admin, {
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
    } else if (existing.review_request_id || existing.status === "sent") {
        logger.info({ paymentId: event.paymentId }, "[square] payment already sent — ignore update");
        return;
    } else if (existing.customer_email || existing.customer_phone) {
        // Contact already known; do not re-send on tip/status updates.
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
            contact = await resolveViaCustomerId({ payment, accessToken });
        }

        const sendOutcome = await sendSquareReviewRequest({
            businessId: connection.business_id,
            autoSendEnabled: connection.auto_send_enabled,
            environment: connection.environment,
            contact,
        });

        // Race: payment.updated may finish after payment.created already sent.
        const latest = await findExistingEvent(admin, event.merchantId, event.paymentId);
        if ((latest?.review_request_id || latest?.status === "sent") && sendOutcome.kind !== "sent") {
            logger.info({ paymentId: event.paymentId }, "[square] preserving prior sent row");
            return;
        }

        const status = squareStatusFromSendOutcome(sendOutcome);
        const patch: Record<string, unknown> = {
            status,
            customer_email: contact.email,
            customer_phone: contact.phone,
            customer_name: contact.name,
        };
        if (sendOutcome.kind === "sent") patch.review_request_id = sendOutcome.requestId;
        if (sendOutcome.kind === "skipped_guard" || sendOutcome.kind === "send_failed") {
            patch.error_message = sendOutcome.message.slice(0, 500);
        }

        await admin
            .from("square_payment_events")
            .update(patch)
            .eq("merchant_id", event.merchantId)
            .eq("payment_id", event.paymentId);

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
        await admin
            .from("square_payment_events")
            .update({ status: "error", error_message: message.slice(0, 500) })
            .eq("merchant_id", event.merchantId)
            .eq("payment_id", event.paymentId);
        logger.error(
            { err, paymentId: event.paymentId, merchantId: event.merchantId },
            "[square] payment processing failed",
        );
    }
}

async function findExistingEvent(
    admin: Admin,
    merchantId: string,
    paymentId: string,
): Promise<ExistingEvent | null> {
    const { data } = await admin
        .from("square_payment_events")
        .select("id, status, customer_email, customer_phone, review_request_id")
        .eq("merchant_id", merchantId)
        .eq("payment_id", paymentId)
        .maybeSingle();
    return data ?? null;
}

async function resolveViaCustomerId(args: {
    payment: unknown;
    accessToken: string;
}): Promise<SquareResolvedContact> {
    const empty: SquareResolvedContact = { email: null, phone: null, name: null };
    const customerId = extractSquareCustomerId(args.payment);
    if (!customerId) return empty;
    const customer = await fetchSquareCustomer({
        customerId,
        accessToken: args.accessToken,
    });
    if (!customer) return empty;
    return resolveContactFromSquareCustomer(customer);
}

async function insertEvent(
    admin: Admin,
    args: { businessId: string; merchantId: string; paymentId: string; eventType: string },
): Promise<boolean> {
    const { error } = await admin.from("square_payment_events").insert({
        business_id: args.businessId,
        merchant_id: args.merchantId,
        payment_id: args.paymentId,
        event_type: args.eventType,
        status: "received",
    });
    if (error) {
        if (error.code === "23505") return false;
        throw error;
    }
    return true;
}
