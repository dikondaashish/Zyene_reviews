import { logger } from "@/lib/logger";
import {
    isValidNfcOrderPayload,
    nfcOrderPayloadFromSession,
} from "@/lib/nfc/checkout-session";
import type { WebhookAdminClient } from "@/services/stripe/webhook-types";

type NfcOrderInsert = {
    organization_id: string;
    business_id: string;
    user_id: string;
    stripe_checkout_session_id: string;
    quantity: number;
    shipping_id: string;
    amount_total_cents: number;
    shipping_cents: number;
    customer_email: string | null;
    customer_name: string | null;
    shipping_name: string | null;
    shipping_address: Record<string, string | null> | null;
    status: "paid";
};

/** Isolated cast: nfc_orders is not in generated database.types.ts yet. */
function insertNfcOrder(supabase: WebhookAdminClient, row: NfcOrderInsert) {
    return (
        supabase as unknown as {
            from: (table: "nfc_orders") => {
                insert: (value: NfcOrderInsert) => Promise<{ error: { message: string; code?: string } | null }>;
            };
        }
    )
        .from("nfc_orders")
        .insert(row);
}

export async function fulfillNfcCheckout(
    session: Parameters<typeof nfcOrderPayloadFromSession>[0],
    supabase: WebhookAdminClient,
) {
    const payload = nfcOrderPayloadFromSession(session);
    if (!isValidNfcOrderPayload(payload)) {
        logger.error({ sessionId: session.id, payload }, "NFC checkout missing required metadata");
        return;
    }

    const { error } = await insertNfcOrder(supabase, {
        organization_id: payload.organizationId,
        business_id: payload.businessId,
        user_id: payload.userId,
        stripe_checkout_session_id: payload.stripeCheckoutSessionId,
        quantity: payload.quantity,
        shipping_id: payload.shippingId,
        amount_total_cents: payload.amountTotalCents,
        shipping_cents: payload.shippingCents,
        customer_email: payload.customerEmail,
        customer_name: payload.customerName,
        shipping_name: payload.shippingName,
        shipping_address: payload.shippingAddress,
        status: "paid",
    });

    if (error?.code === "23505") return;
    if (error) {
        logger.error({ err: error, sessionId: session.id }, "Failed to persist NFC order");
    }
}
