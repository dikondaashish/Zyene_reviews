import * as Sentry from "@sentry/nextjs";
import type Stripe from "stripe";

import { isMeteredBillingLive } from "@/lib/features/aeo-surfaces";
import { logger } from "@/lib/logger";
import { stripe } from "@/services/stripe/client";
import { invoiceServicePeriodEnd } from "@/services/stripe/invoice-service-period";
import { getPlanByPriceId } from "@/services/stripe/plans";

import type { WebhookAdminClient } from "./webhook-types";

async function subscriptionPlanLinePriceIds(invoice: Stripe.Invoice, subscriptionId: string): Promise<string[]> {
    const lines = invoice.lines.has_more
        ? await stripe.invoices.listLineItems(invoice.id, { limit: 100 }).autoPagingToArray({ limit: 1000 })
        : invoice.lines.data;
    return lines.flatMap((item) => {
        const detail = item.parent?.subscription_item_details;
        const price = item.pricing?.price_details?.price;
        const priceId = typeof price === "string" ? price : price?.id;
        return detail?.subscription === subscriptionId && !detail.proration && priceId ? [priceId] : [];
    });
}

/**
 * Renewal AEO credit grant for invoice.payment_succeeded (subscription_cycle).
 * A missing plan line normally means the plan change has not been projected yet,
 * so the grant throws and Stripe retries. When every plan line is on a price outside
 * the catalog (dashboard enterprise price, rotated price), no retry can ever match it:
 * the organization keeps its previous plan (preserve_entitlements), so the grant is
 * skipped and reported instead of failing every renewal for that customer.
 */
export async function grantRenewalCredit(
    supabase: WebhookAdminClient,
    input: { organizationId: string; planId: string; customerId: string; subscriptionId: string; invoice: Stripe.Invoice },
): Promise<void> {
    const { invoice, subscriptionId, planId } = input;
    const periodEnd = await invoiceServicePeriodEnd(invoice, subscriptionId, planId);
    if (periodEnd === undefined && isMeteredBillingLive()) {
        const priceIds = await subscriptionPlanLinePriceIds(invoice, subscriptionId);
        if (priceIds.length > 0 && priceIds.every((priceId) => !getPlanByPriceId(priceId))) {
            const context = { customerId: input.customerId, subscriptionId, invoiceId: invoice.id,
                organizationId: input.organizationId, planId, priceIds };
            logger.error(context, "Renewal invoice is on an unrecognized Stripe price; AEO credit grant skipped");
            Sentry.captureMessage("Renewal invoice on unrecognized Stripe price", { level: "error",
                tags: { area: "stripe-renewal-credit" }, extra: context });
            return;
        }
    }
    const { resetAeoCreditsForPlan } = await import("@/services/aeo/billing/renewal-credit-reset");
    await resetAeoCreditsForPlan(supabase, { organizationId: input.organizationId, planId,
        customerId: input.customerId, subscriptionId, receiptId: invoice.id, periodEnd });
}
