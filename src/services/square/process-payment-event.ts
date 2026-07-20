import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import {
    fetchSquareCustomer,
    fetchSquarePayment,
    refreshSquareAccessToken,
} from "@/services/square/api-client";
import { getSquareEnvironment } from "@/services/square/config";
import {
    extractSquareCustomerId,
    resolveContactFromSquareCustomer,
    resolveContactFromSquarePayment,
    type SquareResolvedContact,
} from "@/services/square/resolve-contact";
import type { ParsedSquarePaymentEvent } from "@/services/square/webhook-parse";

type Admin = ReturnType<typeof createAdminClient>;

type ExistingEvent = {
    id: string;
    event_type: string;
    status: string;
    customer_email: string | null;
    customer_phone: string | null;
};

/**
 * Phase 1: resolve contact and log only — never sends review requests.
 * payment.created inserts the audit row; payment.updated may enrich contact
 * when Square attaches customer_id asynchronously (common for payment links).
 */
export async function processSquarePaymentEvent(event: ParsedSquarePaymentEvent): Promise<void> {
    const admin = createAdminClient();
    const env = getSquareEnvironment();
    const isCreate = event.eventType === "payment.created";
    const isUpdate = event.eventType === "payment.updated";

    if (!isCreate && !isUpdate) {
        logger.info(
            { paymentId: event.paymentId, eventType: event.eventType },
            "[square] unsupported payment event ignored",
        );
        return;
    }

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
            logger.info(
                { paymentId: event.paymentId },
                "[square] duplicate payment.created skipped",
            );
            return;
        }
        const inserted = await insertEvent(admin, {
            businessId: connection.business_id,
            merchantId: event.merchantId,
            paymentId: event.paymentId,
            eventType: event.eventType,
        });
        if (!inserted) return;
    } else {
        // payment.updated — only enrich rows that still lack contact
        if (!existing) {
            logger.info(
                { paymentId: event.paymentId },
                "[square] payment.updated with no prior row — ignore",
            );
            return;
        }
        if (existing.customer_email || existing.customer_phone) {
            logger.info(
                { paymentId: event.paymentId },
                "[square] payment.updated contact already resolved — ignore",
            );
            return;
        }
    }

    try {
        const accessToken = await decryptAccessToken(admin, connection);
        const payment = await fetchSquarePayment({
            paymentId: event.paymentId,
            accessToken,
        });

        let contact = resolveContactFromSquarePayment(payment);
        if (!contact.email && !contact.phone) {
            contact = await resolveViaCustomerId({ payment, accessToken });
        }

        const status = contact.email || contact.phone ? "resolved" : "skipped_no_contact";

        await admin
            .from("square_payment_events")
            .update({
                status,
                customer_email: contact.email,
                customer_phone: contact.phone,
                customer_name: contact.name,
                error_message: null,
            })
            .eq("merchant_id", event.merchantId)
            .eq("payment_id", event.paymentId);

        logger.info(
            {
                businessId: connection.business_id,
                merchantId: event.merchantId,
                paymentId: event.paymentId,
                eventType: event.eventType,
                status,
                hasEmail: Boolean(contact.email),
                hasPhone: Boolean(contact.phone),
            },
            "[square] Phase1 payment processed (log only)",
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
        .select("id, event_type, status, customer_email, customer_phone")
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
        return refreshSquareAccessToken(admin, connection.id, refreshPlain);
    }

    const { data: accessPlain, error } = await admin.rpc("decrypt_token", {
        ciphertext: connection.access_token_encrypted,
    });
    if (error || !accessPlain) throw error ?? new Error("decrypt access failed");
    return accessPlain;
}
