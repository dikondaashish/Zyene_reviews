import type Stripe from "stripe";
import { stripe } from "@/services/stripe/client";
import type { BillingInvoice } from "@/types/billing-invoices";

const maxCharges = 1000;
const idOf = (value: string | { id: string } | null | undefined) => typeof value === "string" ? value : value?.id;

export function refundStatus(amountPaid: number, amountRefunded: number): BillingInvoice["refundStatus"] {
    if (amountPaid <= 0 || amountRefunded <= 0) return "none";
    return amountRefunded >= amountPaid ? "full" : "partial";
}

/** Payment intents and charges behind an invoice; requires `expand: ["data.payments"]`. */
function paymentReferences(invoice: Stripe.Invoice) {
    return (invoice.payments?.data ?? []).flatMap((payment) =>
        [idOf(payment.payment.payment_intent), idOf(payment.payment.charge)].filter((id): id is string => !!id));
}

/**
 * Refunds never change an invoice's status; they live on its charges. One bounded
 * charge listing covers every invoice on the page instead of a lookup per invoice.
 */
export async function loadInvoiceRefunds(customerId: string, invoices: Stripe.Invoice[]) {
    const refunded = new Map<string, number>();
    const owners = new Map<string, string>();
    for (const invoice of invoices) {
        if (invoice.amount_paid <= 0) continue;
        for (const reference of paymentReferences(invoice)) owners.set(reference, invoice.id);
    }
    if (owners.size === 0) return refunded;

    const since = Math.min(...invoices.filter((invoice) => invoice.amount_paid > 0).map((invoice) => invoice.created));
    const charges = await stripe.charges.list({ customer: customerId, created: { gte: since }, limit: 100 })
        .autoPagingToArray({ limit: maxCharges });
    for (const charge of charges) {
        if (charge.amount_refunded <= 0) continue;
        if (idOf(charge.customer) !== customerId) throw new Error("Charge customer binding mismatch");
        const owner = owners.get(charge.id) ?? owners.get(idOf(charge.payment_intent) ?? "");
        if (owner) refunded.set(owner, (refunded.get(owner) ?? 0) + charge.amount_refunded);
    }
    return refunded;
}
