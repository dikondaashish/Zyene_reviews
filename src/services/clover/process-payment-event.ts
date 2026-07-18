import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import {
    fetchCloverOrderCustomers,
    fetchCloverPayment,
    refreshCloverAccessToken,
} from "@/services/clover/api-client";
import { getCloverEnvironment } from "@/services/clover/config";
import { resolveContactFromCloverPayment } from "@/services/clover/resolve-contact";
import type { ParsedPaymentEvent } from "@/services/clover/webhook-parse";

type Admin = ReturnType<typeof createAdminClient>;

/**
 * Phase 1: fetch payment, resolve contact, persist audit row, log — never send.
 */
export async function processCloverPaymentEvent(event: ParsedPaymentEvent): Promise<void> {
    const admin = createAdminClient();
    const env = getCloverEnvironment();

    const { data: connection, error: connError } = await admin
        .from("clover_connections")
        .select(
            "id, business_id, merchant_id, access_token_encrypted, refresh_token_encrypted, access_token_expires_at",
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
        let payment = await fetchCloverPayment({
            merchantId: event.merchantId,
            paymentId: event.paymentId,
            accessToken,
        });

        let contact = resolveContactFromCloverPayment(payment);
        if (!contact.email && !contact.phone) {
            const orderId = extractOrderId(payment);
            if (orderId) {
                const order = await fetchCloverOrderCustomers({
                    merchantId: event.merchantId,
                    orderId,
                    accessToken,
                });
                if (order) {
                    contact = resolveContactFromCloverPayment({ order });
                    payment = { ...(payment as object), order };
                }
            }
        }

        const status = contact.email || contact.phone ? "resolved" : "skipped_no_contact";
        await admin
            .from("clover_payment_events")
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
                customerName: contact.name,
                // Intentional for sandbox spike verification only:
                customerEmail: contact.email,
                customerPhone: contact.phone,
            },
            "[clover] Phase1 contact resolution (no send)",
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

async function insertEventIfNew(
    admin: Admin,
    args: { businessId: string; merchantId: string; paymentId: string; eventType: string },
): Promise<boolean> {
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

function extractOrderId(payment: unknown): string | null {
    if (!payment || typeof payment !== "object") return null;
    const order = (payment as { order?: unknown }).order;
    if (typeof order === "string") return order;
    if (order && typeof order === "object" && "id" in order) {
        const id = (order as { id?: unknown }).id;
        return typeof id === "string" ? id : null;
    }
    return null;
}
