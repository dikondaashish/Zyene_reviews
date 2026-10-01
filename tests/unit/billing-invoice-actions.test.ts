import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BillingInvoiceRow } from "@/components/settings/billing-invoice-row";
import { billingInvoiceSchema } from "@/types/billing-invoices";

const hostedUrl = "https://invoice.stripe.com/i/example";
const invoice = (overrides = {}) => billingInvoiceSchema.parse({
    id: "in_example", number: "ZYENE-0001", createdAt: "2026-10-01T00:00:00.000Z",
    amount: "$29.99", status: "paid", pdfUrl: "https://pay.stripe.com/invoice/example/pdf",
    hostedUrl, receiptUrl: hostedUrl, paymentUrl: null, ...overrides,
});
const render = (overrides = {}) => renderToStaticMarkup(createElement(BillingInvoiceRow, { invoice: invoice(overrides) }));

describe("invoice download and payment actions", () => {
    it("offers separate invoice and receipt downloads for a paid invoice", () => {
        const html = render();
        expect(html).toContain("Download invoice");
        expect(html).toContain("Download receipt");
        expect(html).toContain(`href="${hostedUrl}"`);
        expect(html).toContain("Open Stripe to download your receipt");
        expect(html).not.toContain("Pay now");
    });

    it("offers Pay now alongside the invoice download for a pending balance", () => {
        const html = render({ status: "open", receiptUrl: null, paymentUrl: hostedUrl });
        expect(html).toContain("Download invoice");
        expect(html).toContain("Pay now");
        expect(html).toContain('aria-label="Pay invoice ZYENE-0001"');
        expect(html).toContain('rel="noopener noreferrer"');
        expect(html).not.toContain("Download receipt");
    });

    it("offers only the invoice download for a free trial", () => {
        const html = render({ amount: "$0.00", isFreeTrial: true, receiptUrl: null });
        expect(html).toContain("Download invoice");
        expect(html).not.toContain("Download receipt");
        expect(html).not.toContain("Pay now");
    });

    it("keeps payment reachable when the invoice PDF is unavailable", () => {
        const html = render({ status: "open", pdfUrl: null, receiptUrl: null, paymentUrl: hostedUrl });
        expect(html).toContain("Pay now");
        expect(html).toContain("View invoice");
        expect(html).not.toContain("Download invoice");
    });

    it.each(["receiptUrl", "paymentUrl"])("rejects unsafe %s destinations", field => {
        expect(() => invoice({ [field]: "https://stripe.com.evil.example/invoice" })).toThrow();
    });
});
