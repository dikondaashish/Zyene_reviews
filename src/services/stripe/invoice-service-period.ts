import type Stripe from "stripe";
import { stripe } from "@/services/stripe/client";
import { getPlanByPriceId } from "@/services/stripe/plans";
import { isMeteredBillingLive } from "@/lib/features/aeo-surfaces";

/** Invoice.period_end looks backward; grant against the paid plan line instead. */
export async function invoiceServicePeriodEnd(
    invoice: Stripe.Invoice, subscriptionId: string, planId: string,
): Promise<number | undefined> {
    if (!isMeteredBillingLive()) return undefined;
    const lines = invoice.lines.has_more
        ? await stripe.invoices.listLineItems(invoice.id, { limit: 100 }).autoPagingToArray({ limit: 1000 })
        : invoice.lines.data;
    const line = lines.find((item) => {
        const detail = item.parent?.subscription_item_details;
        const price = item.pricing?.price_details?.price;
        const priceId = typeof price === "string" ? price : price?.id;
        return detail?.subscription === subscriptionId && !detail.proration &&
            priceId && getPlanByPriceId(priceId)?.id === planId;
    });
    return line?.period.end;
}
