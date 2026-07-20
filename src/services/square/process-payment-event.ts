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
import { shouldProcessSquarePaymentEvent } from "@/services/square/webhook-parse";
import type { ParsedSquarePaymentEvent } from "@/services/square/webhook-parse";

type Admin = ReturnType<typeof createAdminClient>;

/** Phase 1: resolve contact and log only — never sends review requests. */
export async function processSquarePaymentEvent(event: ParsedSquarePaymentEvent): Promise<void> {
    const admin = createAdminClient();
    const env = getSquareEnvironment();

    if (!shouldProcessSquarePaymentEvent(event.eventType)) {
        logger.info(
            {
                paymentId: event.paymentId,
                merchantId: event.merchantId,
                eventType: event.eventType,
            },
            "[square] non-CREATE payment event ignored",
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

    const inserted = await insertEventIfNew(admin, {
        businessId: connection.business_id,
        merchantId: event.merchantId,
        paymentId: event.paymentId,
        eventType: event.eventType,
    });
    if (!inserted) {
        logger.info(
            { paymentId: event.paymentId, merchantId: event.merchantId },
            "[square] duplicate payment event skipped",
        );
        return;
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
            })
            .eq("merchant_id", event.merchantId)
            .eq("payment_id", event.paymentId)
            .eq("event_type", event.eventType);

        logger.info(
            {
                businessId: connection.business_id,
                merchantId: event.merchantId,
                paymentId: event.paymentId,
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
            .eq("payment_id", event.paymentId)
            .eq("event_type", event.eventType);
        logger.error(
            { err, paymentId: event.paymentId, merchantId: event.merchantId },
            "[square] payment processing failed",
        );
    }
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

async function insertEventIfNew(
    admin: Admin,
    args: { businessId: string; merchantId: string; paymentId: string; eventType: string },
): Promise<boolean> {
    const { data: existing } = await admin
        .from("square_payment_events")
        .select("id")
        .eq("merchant_id", args.merchantId)
        .eq("payment_id", args.paymentId)
        .maybeSingle();
    if (existing) return false;

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
