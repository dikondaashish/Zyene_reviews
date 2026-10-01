import type Stripe from "stripe";
import { stripe } from "@/services/stripe/client";
import { stripeInvoiceUrlSchema, type BillingInvoice } from "@/types/billing-invoices";

const currencyFormatters = new Map<string, Intl.NumberFormat>();
const safeUrl = (value: string | null | undefined) => stripeInvoiceUrlSchema.safeParse(value).data ?? null;

/** A zero total alone can also mean a discount or an empty invoice. */
export async function isFreeTrialInvoice(invoice: Stripe.Invoice, customerId: string) {
    if (invoice.total !== 0 || invoice.billing_reason !== "subscription_create") return false;
    const reference = invoice.parent?.subscription_details?.subscription;
    if (!reference) return false;
    const subscriptionId = typeof reference === "string" ? reference : reference.id;
    const lines = invoice.lines.data.filter((line) => line.amount === 0 &&
        line.parent?.type === "subscription_item_details" &&
        line.parent.subscription_item_details?.subscription === subscriptionId);
    if (lines.length === 0) return false;
    const subscription = typeof reference === "string" ? await stripe.subscriptions.retrieve(reference) : reference;
    const subscriptionCustomer = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    if (subscriptionCustomer !== customerId) throw new Error("Subscription customer binding mismatch");
    // Stripe's original trial line survives later changes to the trial dates.
    if (lines.some((line) => /^free trial\b/i.test(line.description ?? ""))) return true;
    const { trial_start: start, trial_end: end } = subscription;
    if (start === null || end === null || end <= start) return false;
    return lines.some((line) => line.period.start >= start && line.period.start < end &&
        line.period.end > line.period.start && line.period.end <= end);
}

export function toBillingInvoice(invoice: Stripe.Invoice, isFreeTrial: boolean): BillingInvoice {
    let formatter = currencyFormatters.get(invoice.currency);
    if (!formatter) {
        formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency });
        currencyFormatters.set(invoice.currency, formatter);
    }
    const fractionDigits = ["isk", "ugx"].includes(invoice.currency) ? 2 : formatter.resolvedOptions().maximumFractionDigits ?? 2;
    return {
        id: invoice.id, number: invoice.number, createdAt: new Date(invoice.created * 1000).toISOString(),
        amount: formatter.format(invoice.total / 10 ** fractionDigits), status: invoice.status ?? "draft", isFreeTrial,
        pdfUrl: safeUrl(invoice.invoice_pdf), hostedUrl: safeUrl(invoice.hosted_invoice_url),
    };
}
