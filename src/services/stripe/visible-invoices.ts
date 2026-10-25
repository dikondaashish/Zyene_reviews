import type Stripe from "stripe";
import { stripe } from "@/services/stripe/client";
import { isFreeTrialInvoice, toBillingInvoice } from "@/services/stripe/invoice-display";
import { loadInvoiceRefunds } from "@/services/stripe/invoice-refunds";

const visiblePageSize = 10;
const maxStripePages = 3;

type VisibleInvoice = { invoice: Stripe.Invoice; freeTrial: boolean };

async function toPage(customerId: string, visible: VisibleInvoice[], nextCursor: string | null) {
    const refunds = await loadInvoiceRefunds(customerId, visible.map(({ invoice }) => invoice));
    return {
        invoices: visible.map(({ invoice, freeTrial }) => toBillingInvoice(invoice, freeTrial, refunds.get(invoice.id))),
        nextCursor,
    };
}

/** The cursor carries display state only; tenant scope always comes from membership. */
export async function loadVisibleBillingInvoices(customerId: string, cursor?: string) {
    let startingAfter = cursor?.split(":")[0];
    let trialIncluded = cursor?.endsWith(":trial") ?? false;
    const visible: VisibleInvoice[] = [];
    const nextCursor = () => startingAfter ? `${startingAfter}${trialIncluded ? ":trial" : ""}` : null;

    for (let batch = 0; batch < maxStripePages; batch++) {
        const page = await stripe.invoices.list({
            customer: customerId, limit: 100, expand: ["data.payments"],
            ...(startingAfter ? { starting_after: startingAfter } : {}),
        });
        if (page.data.length === 0) return toPage(customerId, visible, null);
        for (const [index, invoice] of page.data.entries()) {
            const invoiceCustomer = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
            if (invoiceCustomer !== customerId) throw new Error("Invoice customer binding mismatch");
            if (invoice.id === startingAfter) throw new Error("Invoice pagination did not advance");
            startingAfter = invoice.id;
            const freeTrial = !trialIncluded && await isFreeTrialInvoice(invoice, customerId);
            if (invoice.total > 0 || freeTrial) {
                visible.push({ invoice, freeTrial });
                trialIncluded ||= freeTrial;
            }
            if (visible.length === visiblePageSize) {
                return toPage(customerId, visible, index < page.data.length - 1 || page.has_more ? nextCursor() : null);
            }
        }
        if (!page.has_more) return toPage(customerId, visible, null);
    }
    return toPage(customerId, visible, nextCursor());
}
