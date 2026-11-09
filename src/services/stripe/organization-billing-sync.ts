import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";
import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { stripe } from "@/services/stripe/client";
import { FREE_LIMITS, getPlanByPriceId } from "@/services/stripe/plans";
import type { StripeOrganizationUpdatePayload } from "@/types/api-routes";
import { planLimitsToOrganizationColumns } from "@/services/stripe/webhook-plan-columns";
import { applySubscriptionProjection, canceledBillingProjection } from "@/services/stripe/subscription-projection";

function isStripeResourceMissing(e: unknown): boolean {
    return (
        typeof e === "object" &&
        e !== null &&
        "code" in e &&
        (e as { code?: string }).code === "resource_missing"
    );
}

/**
 * An entitled subscription on a price outside the plan catalog (dashboard-made enterprise
 * price, rotated price). Granting a guessed plan is wrong and throwing makes Stripe retry
 * every event for this customer for days, so record only the status fields and let
 * apply_stripe_subscription_projection keep the organization's current plan and limits.
 */
function unrecognizedPriceProjection(
    subscription: Stripe.Subscription,
    priceId: string | undefined,
    base: StripeOrganizationUpdatePayload,
): StripeOrganizationUpdatePayload & Record<string, unknown> {
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
    const context = { customerId, subscriptionId: subscription.id, priceId: priceId ?? null, status: subscription.status };
    logger.error(context, "Unrecognized Stripe subscription price; plan and limits left unchanged");
    Sentry.captureMessage("Unrecognized Stripe subscription price", { level: "error",
        tags: { area: "stripe-billing-projection" }, extra: context });
    return { plan_status: base.plan_status, stripe_subscription_id: base.stripe_subscription_id,
        trial_ends_at: base.trial_ends_at, preserve_entitlements: true };
}

/** Maps a live Stripe subscription to organizations row fields (matches customer.subscription.updated semantics). */
export function stripeSubscriptionToOrganizationUpdate(
    subscription: Stripe.Subscription
): StripeOrganizationUpdatePayload & Record<string, unknown> {
    const priceId = subscription.items.data[0]?.price?.id;
    const status = subscription.status;

    let planStatus = "none";
    if (status === "active") planStatus = "active";
    else if (status === "past_due") planStatus = "past_due";
    else if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") planStatus = "canceled";
    else if (status === "trialing") planStatus = "trialing";

    const updateData: StripeOrganizationUpdatePayload & Record<string, unknown> = {
        plan: "free",
        ...planLimitsToOrganizationColumns(FREE_LIMITS),
        plan_status: planStatus,
        stripe_subscription_id: subscription.id,
        trial_ends_at:
            status === "trialing" && subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
    };

    if (["active", "trialing", "past_due"].includes(planStatus)) {
        const plan = priceId ? getPlanByPriceId(priceId) : null;
        if (!plan) return unrecognizedPriceProjection(subscription, priceId, updateData);
        updateData.plan = plan.id;
        Object.assign(updateData, planLimitsToOrganizationColumns(plan.limits));
    }

    return updateData;
}

const TERMINAL_SUBSCRIPTION_STATUSES = new Set([
    "canceled",
    "unpaid",
    "incomplete_expired",
]);

/** After subscription is ended or missing in Stripe - same net effect as customer.subscription.deleted. */
export async function clearOrganizationBillingAfterCancellation(
    admin: SupabaseClient,
    org: { stripe_customer_id: string | null; stripe_subscription_id: string | null }
): Promise<void> {
    if (!org.stripe_customer_id || !org.stripe_subscription_id) throw new Error("Missing billing binding");
    await applySubscriptionProjection(admin, org.stripe_customer_id, org.stripe_subscription_id,
        canceledBillingProjection(), { clear: true });
}

/**
 * Lazy reconcile: refresh org billing row from Stripe when loading billing UI.
 * Handles dashboard-cancel / deleted subscription not yet reflected in DB.
 */
export async function reconcileOrganizationBillingFromStripe(
    admin: SupabaseClient,
    org: { id: string; stripe_subscription_id: string | null; stripe_customer_id: string | null }
): Promise<void> {
    if (!org.stripe_subscription_id) return;

    try {
        const observedAt = new Date().toISOString();
        const subscription = await stripe.subscriptions.retrieve(org.stripe_subscription_id);
        const subscriptionCustomerId =
            typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
        if (
            org.stripe_customer_id &&
            subscriptionCustomerId &&
            subscriptionCustomerId !== org.stripe_customer_id
        ) {
            return;
        }

        if (TERMINAL_SUBSCRIPTION_STATUSES.has(subscription.status)) {
            await clearOrganizationBillingAfterCancellation(admin, org);
            return;
        }

        const updateData = stripeSubscriptionToOrganizationUpdate(subscription);
        if (!org.stripe_customer_id || subscriptionCustomerId !== org.stripe_customer_id) return;
        await applySubscriptionProjection(admin, org.stripe_customer_id, subscription.id, updateData, { observedAt });
    } catch (e: unknown) {
        if (isStripeResourceMissing(e)) {
            await clearOrganizationBillingAfterCancellation(admin, org);
            return;
        }
        logger.error({ err: e }, "[reconcileOrganizationBillingFromStripe]");
    }
}
