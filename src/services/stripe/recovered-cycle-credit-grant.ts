import type Stripe from "stripe";

import { isMeteredBillingLive } from "@/lib/features/aeo-surfaces";
import { logger } from "@/lib/logger";
import { stripe } from "@/services/stripe/client";
import { invoiceServicePeriodEnd } from "@/services/stripe/invoice-service-period";

import type { WebhookAdminClient } from "./webhook-types";

const ENTITLED_STATUSES = new Set(["active", "trialing"]);

/** True when a subscription.updated event moved the subscription back into an entitled state. */
export function isRecoveryToEntitled(previousStatus: string | undefined, currentStatus: string): boolean {
    return !!previousStatus && !ENTITLED_STATUSES.has(previousStatus) && ENTITLED_STATUSES.has(currentStatus);
}

const idOf = (value: string | { id: string } | null | undefined) =>
    typeof value === "string" ? value : value?.id;

/**
 * Stripe delivers invoice.payment_succeeded and customer.subscription.updated
 * (past_due -> active) in either order after a smart retry. When the invoice
 * lands first, apply_stripe_credit_grant refuses it because the organization is
 * still projected past_due. Once the subscription is entitled again, re-attempt
 * the grant for the paid renewal invoice. The receipt (keyed by invoice id) and
 * the per-org period watermark keep this idempotent with the invoice handler.
 * The organization is resolved from its current Stripe binding rather than from
 * this event's projection result, so a projection skipped as stale (a newer
 * snapshot already committed) still gets its grant attempt.
 */
export async function grantRecoveredCycleCredit(
    supabase: WebhookAdminClient,
    input: { customerId: string; subscription: Stripe.Subscription },
): Promise<void> {
    if (!isMeteredBillingLive()) return;
    const { subscription, customerId } = input;
    const invoiceId = idOf(subscription.latest_invoice);
    if (!invoiceId) return;

    // Unbound customer, replaced subscription, or a newer non-entitled snapshot: nothing to grant.
    const { data: org, error } = await supabase
        .from("organizations").select("id, plan, plan_status")
        .eq("stripe_customer_id", customerId)
        .eq("stripe_subscription_id", subscription.id).maybeSingle();
    if (error) throw error;
    if (!org?.plan || !ENTITLED_STATUSES.has(org.plan_status)) return;

    const invoice = await stripe.invoices.retrieve(invoiceId);
    if (invoice.status !== "paid" || invoice.billing_reason !== "subscription_cycle") return;
    if (idOf(invoice.customer) !== customerId) return;
    if (idOf(invoice.parent?.subscription_details?.subscription) !== subscription.id) return;

    const periodEnd = await invoiceServicePeriodEnd(invoice, subscription.id, org.plan);
    if (!periodEnd) {
        // The invoice handler stays authoritative (and retryable) for this shape.
        logger.warn({ invoiceId, organizationId: org.id }, "Recovered renewal has no plan line for the current plan; credit grant skipped");
        return;
    }
    const { resetAeoCreditsForPlan } = await import("@/services/aeo/billing/renewal-credit-reset");
    await resetAeoCreditsForPlan(supabase, { organizationId: org.id, planId: org.plan,
        customerId, subscriptionId: subscription.id, receiptId: invoice.id, periodEnd });
}
