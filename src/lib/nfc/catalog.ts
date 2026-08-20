export const NFC_CARD = {
    id: "google-nfc-card",
    name: "Google Review NFC Card",
    description: "Customers tap their phone to leave a Google review.",
    unitAmountCents: 999,
    minQty: 1,
    maxQty: 20,
    imageSrc: "/google-nfc-card-design.png",
} as const;

export const NFC_SHIPPING = {
    standard: {
        id: "standard",
        name: "Standard shipping",
        amountCents: 499,
        estimate: "5–8 business days",
    },
    expedited: {
        id: "expedited",
        name: "Expedited shipping",
        amountCents: 999,
        estimate: "2–3 business days",
    },
} as const;

export type NfcShippingId = keyof typeof NFC_SHIPPING;

export const NFC_CHECKOUT_KIND = "nfc_order";

export function isNfcShippingId(value: string): value is NfcShippingId {
    return value === "standard" || value === "expedited";
}

export function clampNfcQuantity(value: number): number {
    if (!Number.isInteger(value)) return NFC_CARD.minQty;
    return Math.min(NFC_CARD.maxQty, Math.max(NFC_CARD.minQty, value));
}

export function nfcOrderTotals(quantity: number, shippingId: NfcShippingId) {
    const qty = clampNfcQuantity(quantity);
    const subtotalCents = NFC_CARD.unitAmountCents * qty;
    const shippingCents = NFC_SHIPPING[shippingId].amountCents;
    return {
        quantity: qty,
        subtotalCents,
        shippingCents,
        totalCents: subtotalCents + shippingCents,
    };
}

export function formatUsdFromCents(cents: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(cents / 100);
}
