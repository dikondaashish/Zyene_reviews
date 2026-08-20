const NFC_IMAGES = [
    "/nfc/review-stand.jpg",
    "/nfc/review-stand-2.jpg",
    "/nfc/review-stand-3.jpg",
    "/nfc/review-stand-4.jpg",
    "/nfc/review-stand-5.jpg",
    "/nfc/review-stand-6.jpg",
    "/nfc/review-stand-7.jpg",
    "/nfc/review-stand-8.jpg",
    "/nfc/review-stand-9.jpg",
    "/nfc/review-stand-10.jpg",
    "/nfc/review-stand-11.jpg",
    "/nfc/review-stand-12.jpg",
] as const;

export const NFC_CARD = {
    id: "nfc-review-stand",
    name: "NFC Review Stand",
    description:
        "Customers tap NFC or scan the QR code to leave a Google review. No app required.",
    unitAmountCents: 499,
    minQty: 1,
    maxQty: 20,
    imageSrc: NFC_IMAGES[0],
    imageSrcs: NFC_IMAGES,
    videoSrc: "/nfc/review-stand.mp4",
    noun: { one: "stand", other: "stands" },
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
        amountCents: 699,
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

const USD_FORMATTER = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export function formatUsdFromCents(cents: number): string {
    return USD_FORMATTER.format(cents / 100);
}

export function nfcItemLabel(quantity: number): string {
    const qty = clampNfcQuantity(quantity);
    return qty === 1 ? `1 NFC ${NFC_CARD.noun.one}` : `${qty} NFC ${NFC_CARD.noun.other}`;
}
