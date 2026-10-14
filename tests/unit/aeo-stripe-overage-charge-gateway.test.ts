import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => {
    class StripeCardError extends Error {}
    class StripeInvalidRequestError extends Error {}
    return { createInvoice: vi.fn(), createItem: vi.fn(), StripeCardError, StripeInvalidRequestError };
});
vi.mock("stripe", () => ({
    default: { errors: { StripeCardError: m.StripeCardError, StripeInvalidRequestError: m.StripeInvalidRequestError } },
}));
vi.mock("@/services/stripe/client", () => ({
    stripe: { invoices: { create: m.createInvoice }, invoiceItems: { create: m.createItem } },
}));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() } }));

import {
    AEO_OVERAGE_PRICE_ID,
    StripeOverageChargeGateway,
} from "@/services/aeo/billing/stripe-overage-charge-gateway";

const input = { sampleId: "sample_1", stripeCustomerId: "cus_1", amountMicroUsd: 2_500_000 };

beforeEach(() => {
    vi.resetAllMocks();
    m.createInvoice.mockResolvedValue({ id: "in_1" });
    m.createItem.mockResolvedValue({ id: "ii_1" });
});

describe("StripeOverageChargeGateway", () => {
    it("attaches the overage item to the invoice it creates, so the invoice is not empty", async () => {
        const result = await new StripeOverageChargeGateway().chargeOverage(input);

        expect(m.createInvoice.mock.invocationCallOrder[0]).toBeLessThan(m.createItem.mock.invocationCallOrder[0]);
        expect(m.createInvoice).toHaveBeenCalledWith(
            expect.objectContaining({
                customer: "cus_1",
                collection_method: "charge_automatically",
                auto_advance: true,
                pending_invoice_items_behavior: "exclude",
            }),
            { idempotencyKey: "aeo-overage-invoice-v2-sample_1" }
        );
        expect(m.createItem).toHaveBeenCalledWith(
            { customer: "cus_1", invoice: "in_1", pricing: { price: AEO_OVERAGE_PRICE_ID } },
            { idempotencyKey: "aeo-overage-item-v2-sample_1" }
        );
        expect(result).toEqual({ charged: true, stripeInvoiceItemId: "ii_1" });
    });

    it("returns a declined card as data instead of throwing", async () => {
        m.createItem.mockRejectedValue(new m.StripeCardError("Your card was declined."));

        await expect(new StripeOverageChargeGateway().chargeOverage(input)).resolves.toEqual({
            charged: false,
            reason: "Your card was declined.",
        });
    });

    it("rethrows transient failures so the idempotent step can retry", async () => {
        m.createInvoice.mockRejectedValue(new Error("network down"));

        await expect(new StripeOverageChargeGateway().chargeOverage(input)).rejects.toThrow("network down");
        expect(m.createItem).not.toHaveBeenCalled();
    });

    it("never reports a charge when Stripe returns an invoice without an id", async () => {
        m.createInvoice.mockResolvedValue({ id: undefined });

        await expect(new StripeOverageChargeGateway().chargeOverage(input)).rejects.toThrow("without an id");
        expect(m.createItem).not.toHaveBeenCalled();
    });
});
