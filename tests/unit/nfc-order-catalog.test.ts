import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
    clampNfcQuantity,
    formatUsdFromCents,
    NFC_CARD,
    nfcItemLabel,
    nfcOrderTotals,
} from "@/lib/nfc/catalog";
import {
    isNfcCheckoutSession,
    isValidNfcOrderPayload,
    nfcOrderPayloadFromSession,
} from "@/lib/nfc/checkout-session";

describe("NFC catalog", () => {
    it("sells the PVC NFC tap and QR review stand", () => {
        expect(NFC_CARD.id).toBe("nfc-review-stand");
        expect(NFC_CARD.name).toBe("NFC Review Stand");
        expect(NFC_CARD.imageSrc).toBe("/nfc/review-stand.jpg");
        expect(NFC_CARD.videoSrc).toBe("/nfc/review-stand.mp4");
        expect(nfcItemLabel(1)).toBe("1 NFC stand");
        expect(nfcItemLabel(3)).toBe("3 NFC stands");
        expect(fs.existsSync(path.join(process.cwd(), "public/nfc/review-stand.jpg"))).toBe(true);
        expect(fs.existsSync(path.join(process.cwd(), "public/nfc/review-stand.mp4"))).toBe(true);
    });

    it("prices one stand at $9.99 plus standard shipping", () => {
        expect(NFC_CARD.unitAmountCents).toBe(999);
        expect(nfcOrderTotals(1, "standard")).toEqual({
            quantity: 1,
            subtotalCents: 999,
            shippingCents: 499,
            totalCents: 1498,
        });
        expect(formatUsdFromCents(1498)).toBe("$14.98");
    });

    it("clamps quantity to 1–20", () => {
        expect(clampNfcQuantity(0)).toBe(1);
        expect(clampNfcQuantity(21)).toBe(20);
        expect(nfcOrderTotals(3, "expedited").totalCents).toBe(999 * 3 + 999);
    });

    it("scales the line total when quantity changes", () => {
        expect(nfcOrderTotals(1, "standard").subtotalCents).toBe(999);
        expect(nfcOrderTotals(11, "standard")).toEqual({
            quantity: 11,
            subtotalCents: 10989,
            shippingCents: 499,
            totalCents: 11488,
        });
        expect(formatUsdFromCents(10989)).toBe("$109.89");
    });
});

describe("NFC checkout session parsing", () => {
    it("identifies NFC sessions without treating them as subscriptions", () => {
        expect(isNfcCheckoutSession({ metadata: { kind: "nfc_order" }, mode: "payment" })).toBe(
            true,
        );
        expect(isNfcCheckoutSession({ metadata: { organization_id: "org" }, mode: "subscription" })).toBe(
            false,
        );
    });

    it("requires org, business, user, and quantity before fulfilling", () => {
        const payload = nfcOrderPayloadFromSession({
            id: "cs_test_1",
            metadata: {
                kind: "nfc_order",
                organization_id: "org_1",
                business_id: "biz_1",
                user_id: "user_1",
                quantity: "2",
                shipping_id: "standard",
            },
            amount_total: 2497,
            shipping_cost: { amount_total: 499 },
        });
        expect(isValidNfcOrderPayload(payload)).toBe(true);
        expect(payload.quantity).toBe(2);
        expect(
            isValidNfcOrderPayload(
                nfcOrderPayloadFromSession({ id: "cs_test_2", metadata: { kind: "nfc_order" } }),
            ),
        ).toBe(false);
    });
});

describe("NFC order dialog trigger", () => {
    it("opens in the dashboard instead of a marketing tab", () => {
        const source = fs.readFileSync(
            path.join(process.cwd(), "src/components/dashboard/customer-portal-card-nfc-upsell.tsx"),
            "utf8",
        );
        expect(source).not.toContain("zyenereviews.com/nfc-cards");
        expect(source).not.toContain("google-nfc-card-design.png");
        expect(source).not.toContain('target="_blank"');
        expect(source).toContain("NfcOrderDialog");
        expect(source).toContain("NFC_CARD.imageSrc");
        expect(source).toContain("order.setOpen(true)");
    });

    it("binds product and cart to the same quantity", () => {
        const hook = fs.readFileSync(
            path.join(process.cwd(), "src/components/dashboard/use-nfc-order.ts"),
            "utf8",
        );
        const dialog = fs.readFileSync(
            path.join(process.cwd(), "src/components/dashboard/nfc-order-dialog.tsx"),
            "utf8",
        );
        const product = fs.readFileSync(
            path.join(process.cwd(), "src/components/dashboard/nfc-order-product.tsx"),
            "utf8",
        );
        expect(hook).not.toContain("cartQty");
        expect(dialog).toContain("quantity={order.quantity}");
        expect(product).toContain("nfcOrderTotals(quantity");
        expect(product).toContain("NfcOrderMedia");
        expect(dialog).toContain("Order an NFC review stand");
    });
});
