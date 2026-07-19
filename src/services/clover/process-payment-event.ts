import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import {
    fetchCloverCustomer,
    fetchCloverPayment,
    refreshCloverAccessToken,
} from "@/services/clover/api-client";
import { getCloverEnvironment } from "@/services/clover/config";
import {
    extractCloverCustomerIds,
    resolveContactFromCloverPayment,
    type CloverResolvedContact,
} from "@/services/clover/resolve-contact";
import { shouldProcessCloverPaymentEvent } from "@/services/clover/payment-event-guard";
import {
    cloverStatusFromSendOutcome,
    sendCloverReviewRequest,
} from "@/services/clover/send-from-payment";
import type { ParsedPaymentEvent } from "@/services/clover/webhook-parse";

type Admin = ReturnType<typeof createAdminClient>;

/** Phase 2: resolve contact, then send when auto_send_enabled (sandbox or production). */
export async function processCloverPaymentEvent(event: ParsedPaymentEvent): Promise<void> {
    const admin = createAdminClient();
    const env = getCloverEnvironment();

    // Only the first CREATE for a payment may trigger a review request.
    // Later UPDATE (refund / tip adjust / void) must not send again.
    if (!shouldProcessCloverPaymentEvent(event.eventType)) {
        logger.info(
            {
                paymentId: event.paymentId,
                merchantId: event.merchantId,
                eventType: event.eventType,
            },
            "[clover] non-CREATE payment event ignored",
        );
        return;
    }

    const { data: connection, error: connError } = await admin
        .from("clover_connections")
        .select(
            "id, business_id, merchant_id, environment, auto_send_enabled, access_token_encrypted, refresh_token_encrypted, access_token_expires_at",
        )
        .eq("merchant_id", event.merchantId)
        .eq("environment", env)
        .maybeSingle();

    if (connError || !connection) {
        logger.warn(
            { merchantId: event.merchantId, paymentId: event.paymentId },
            "[clover] payment event for unknown merchant — ignore",
        );
        return;
    }

    const inserted = await insertEventIfNew(admin, {
        businessId: connection.business_id,
        merchantId: event.merchantId,
        paymentId: event.paymentId,
        eventType: event.eventType,
    });
    if (!inserted) {
        logger.info(
            { paymentId: event.paymentId, merchantId: event.merchantId },
            "[clover] duplicate payment event skipped",
        );
        return;
    }

    try {
        const accessToken = await decryptAccessToken(admin, connection);
        const payment = await fetchCloverPayment({
            merchantId: event.merchantId,
            paymentId: event.paymentId,
            accessToken,
        });

        let contact = resolveContactFromCloverPayment(payment);
        if (!contact.email && !contact.phone) {
            contact = await resolveViaCustomerIds({
                merchantId: event.merchantId,
                payment,
                accessToken,
            });
        }

        const sendOutcome = await sendCloverReviewRequest({
            businessId: connection.business_id,
            autoSendEnabled: connection.auto_send_enabled,
            environment: connection.environment,
            contact,
        });

        const status = cloverStatusFromSendOutcome(sendOutcome);
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
            .from("clover_payment_events")
            .update(patch)
            .eq("merchant_id", event.merchantId)
            .eq("payment_id", event.paymentId)
            .eq("event_type", event.eventType);

        logger.info(
            {
                businessId: connection.business_id,
                merchantId: event.merchantId,
                paymentId: event.paymentId,
                status,
                requestId: sendOutcome.kind === "sent" ? sendOutcome.requestId : null,
            },
            "[clover] Phase2 payment processed",
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "unknown error";
        await admin
            .from("clover_payment_events")
            .update({ status: "error", error_message: message.slice(0, 500) })
            .eq("merchant_id", event.merchantId)
            .eq("payment_id", event.paymentId)
            .eq("event_type", event.eventType);
        logger.error(
            { err, paymentId: event.paymentId, merchantId: event.merchantId },
            "[clover] payment processing failed",
        );
    }
}

async function resolveViaCustomerIds(args: {
    merchantId: string;
    payment: unknown;
    accessToken: string;
}): Promise<CloverResolvedContact> {
    const empty: CloverResolvedContact = { email: null, phone: null, name: null };
    for (const customerId of extractCloverCustomerIds(args.payment)) {
        const customer = await fetchCloverCustomer({
            merchantId: args.merchantId,
            customerId,
            accessToken: args.accessToken,
        });
        if (!customer) continue;
        const contact = resolveContactFromCloverPayment({ customer });
        if (contact.email || contact.phone) return contact;
    }
    return empty;
}

async function insertEventIfNew(
    admin: Admin,
    args: { businessId: string; merchantId: string; paymentId: string; eventType: string },
): Promise<boolean> {
    // If we already recorded this payment (any event type), do not process again.
    const { data: existing } = await admin
        .from("clover_payment_events")
        .select("id")
        .eq("merchant_id", args.merchantId)
        .eq("payment_id", args.paymentId)
        .maybeSingle();
    if (existing) return false;

    const { error } = await admin.from("clover_payment_events").insert({
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

async function decryptAccessToken(
    admin: Admin,
    connection: {
        id: string;
        access_token_encrypted: string;
        refresh_token_encrypted: string | null;
        access_token_expires_at: string | null;
    },
): Promise<string> {
    const expiresAt = connection.access_token_expires_at
        ? new Date(connection.access_token_expires_at).getTime()
        : null;
    const expired = expiresAt != null && expiresAt < Date.now() + 60_000;

    if (expired && connection.refresh_token_encrypted) {
        const { data: refreshPlain, error } = await admin.rpc("decrypt_token", {
            ciphertext: connection.refresh_token_encrypted,
        });
        if (error || !refreshPlain) throw error ?? new Error("decrypt refresh failed");
        return refreshCloverAccessToken(admin, connection.id, refreshPlain);
    }

    const { data: accessPlain, error } = await admin.rpc("decrypt_token", {
        ciphertext: connection.access_token_encrypted,
    });
    if (error || !accessPlain) throw error ?? new Error("decrypt access failed");
    return accessPlain;
}
