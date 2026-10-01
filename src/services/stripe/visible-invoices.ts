import { stripe } from "@/services/stripe/client";
import { isFreeTrialInvoice, toBillingInvoice } from "@/services/stripe/invoice-display";
import type { BillingInvoice } from "@/types/billing-invoices";

const visiblePageSize = 10;
const maxStripePages = 3;

/** The cursor carries display state only; tenant scope always comes from membership. */
export async function loadVisibleBillingInvoices(customerId: string, cursor?: string) {
    let startingAfter = cursor?.split(":")[0];
    let trialIncluded = cursor?.endsWith(":trial") ?? false;
    const invoices: BillingInvoice[] = [];
    const nextCursor = () => startingAfter ? `${startingAfter}${trialIncluded ? ":trial" : ""}` : null;

    for (let batch = 0; batch < maxStripePages; batch++) {
        const page = await stripe.invoices.list({
            customer: customerId, limit: 100,
            ...(startingAfter ? { starting_after: startingAfter } : {}),
        });
        if (page.data.length === 0) return { invoices, nextCursor: null };
        for (const [index, invoice] of page.data.entries()) {
            const invoiceCustomer = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
            if (invoiceCustomer !== customerId) throw new Error("Invoice customer binding mismatch");
            if (invoice.id === startingAfter) throw new Error("Invoice pagination did not advance");
            startingAfter = invoice.id;
            const freeTrial = !trialIncluded && await isFreeTrialInvoice(invoice, customerId);
            if (invoice.total > 0 || freeTrial) {
                invoices.push(toBillingInvoice(invoice, freeTrial));
                trialIncluded ||= freeTrial;
            }
            if (invoices.length === visiblePageSize) {
                return { invoices, nextCursor: index < page.data.length - 1 || page.has_more ? nextCursor() : null };
            }
        }
        if (!page.has_more) return { invoices, nextCursor: null };
    }
    return { invoices, nextCursor: nextCursor() };
}
