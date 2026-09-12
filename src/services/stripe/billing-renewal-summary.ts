import { stripe } from "@/services/stripe/client";
import { logger } from "@/lib/logger";

export type BillingRenewalSummary = { renewalAt: string | null; amount: string | null; canceled: boolean };
/** Read-only preview: Stripe does not create an invoice or charge the customer. */
export async function loadBillingRenewalSummary(subscriptionId: string | null): Promise<BillingRenewalSummary | null> {
    if (!subscriptionId) return null;
    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const periodEnd = subscription.status === "trialing" ? subscription.trial_end : subscription.items.data[0]?.current_period_end;
        const canceled = subscription.cancel_at_period_end || subscription.status === "canceled";
        let amount: string | null = null;
        if (!canceled) {
            const invoice = await stripe.invoices.createPreview({ subscription: subscriptionId });
            const fractionDigits = new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency }).resolvedOptions().maximumFractionDigits ?? 2;
            amount = new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency }).format(invoice.amount_due / 10 ** fractionDigits);
        }
        return { renewalAt: periodEnd ? new Date(periodEnd * 1000).toISOString() : null, amount, canceled };
    } catch (err) {
        logger.warn({ err }, "Could not preview billing renewal");
        return null;
    }
}
