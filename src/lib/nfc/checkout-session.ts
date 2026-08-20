import { NFC_CHECKOUT_KIND } from "@/lib/nfc/catalog";

export function isNfcCheckoutSession(session: {
    metadata?: Record<string, string> | null;
    mode?: string | null;
}): boolean {
    return session.metadata?.kind === NFC_CHECKOUT_KIND;
}

export function nfcOrderPayloadFromSession(session: {
    id: string;
    metadata?: Record<string, string> | null;
    amount_total?: number | null;
    customer_details?: { email?: string | null; name?: string | null } | null;
    shipping_cost?: { amount_total?: number | null } | null;
    shipping_details?: {
        name?: string | null;
        address?: Record<string, string | null> | null;
    } | null;
}) {
    const metadata = session.metadata ?? {};
    const quantity = Number.parseInt(metadata.quantity ?? "0", 10);
    return {
        stripeCheckoutSessionId: session.id,
        organizationId: metadata.organization_id ?? "",
        businessId: metadata.business_id ?? "",
        userId: metadata.user_id ?? "",
        quantity: Number.isFinite(quantity) ? quantity : 0,
        shippingId: metadata.shipping_id ?? "standard",
        amountTotalCents: session.amount_total ?? 0,
        shippingCents: session.shipping_cost?.amount_total ?? 0,
        customerEmail: session.customer_details?.email ?? null,
        customerName: session.customer_details?.name ?? session.shipping_details?.name ?? null,
        shippingName: session.shipping_details?.name ?? null,
        shippingAddress: session.shipping_details?.address ?? null,
    };
}

export function isValidNfcOrderPayload(payload: ReturnType<typeof nfcOrderPayloadFromSession>) {
    return Boolean(
        payload.stripeCheckoutSessionId &&
            payload.organizationId &&
            payload.businessId &&
            payload.userId &&
            payload.quantity >= 1,
    );
}
