import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { stripe } from "@/services/stripe/client";
import { FREE_LIMITS, getPlanByPriceId } from "@/services/stripe/plans";
import type { StripeOrganizationUpdatePayload } from "@/types/api-routes";

function isStripeResourceMissing(e: unknown): boolean {
    return (
        typeof e === "object" &&
        e !== null &&
        "code" in e &&
        (e as { code?: string }).code === "resource_missing"
    );
}

/** Maps a live Stripe subscription to organizations row fields (matches customer.subscription.updated semantics). */
export function stripeSubscriptionToOrganizationUpdate(
    subscription: Stripe.Subscription
): StripeOrganizationUpdatePayload & Record<string, unknown> {
    const priceId = subscription.items.data[0]?.price?.id;
    const status = subscription.status;

    let planStatus = "active";
    if (status === "past_due") planStatus = "past_due";
    else if (status === "canceled" || status === "unpaid") planStatus = "canceled";
    else if (status === "trialing") planStatus = "trialing";

    const updateData: StripeOrganizationUpdatePayload & Record<string, unknown> = {
        plan_status: planStatus,
        stripe_subscription_id: subscription.id,
        trial_ends_at:
            status === "trialing" && subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
    };

    if (priceId) {
        const plan = getPlanByPriceId(priceId);
        if (plan) {
            updateData.plan = plan.id;
            updateData.max_businesses = plan.limits.maxLocations;
            updateData.max_team_members = plan.limits.teamMembers;
            updateData.max_review_requests_per_month =
                plan.limits.emailRequestsPerMonth + plan.limits.smsRequestsPerMonth + plan.limits.linkRequestsPerMonth;
            updateData.max_ai_replies_per_month = plan.limits.smartRepliesPerMonth;
            updateData.max_email_requests_per_month = plan.limits.emailRequestsPerMonth;
            updateData.max_sms_requests_per_month = plan.limits.smsRequestsPerMonth;
            updateData.max_link_requests_per_month = plan.limits.linkRequestsPerMonth;
        }
    }

    return updateData;
}

const TERMINAL_SUBSCRIPTION_STATUSES = new Set([
    "canceled",
    "unpaid",
    "incomplete_expired",
]);

/** After subscription is ended or missing in Stripe — same net effect as customer.subscription.deleted. */
export async function clearOrganizationBillingAfterCancellation(
    admin: SupabaseClient,
    organizationId: string
): Promise<void> {
    await admin
        .from("organizations")
        .update({
            plan: "free",
            plan_status: "canceled",
            stripe_subscription_id: null,
            trial_ends_at: null,
            max_businesses: FREE_LIMITS.maxLocations,
            max_team_members: FREE_LIMITS.teamMembers,
            max_review_requests_per_month:
                FREE_LIMITS.emailRequestsPerMonth + FREE_LIMITS.smsRequestsPerMonth + FREE_LIMITS.linkRequestsPerMonth,
            max_ai_replies_per_month: FREE_LIMITS.smartRepliesPerMonth,
            max_email_requests_per_month: FREE_LIMITS.emailRequestsPerMonth,
            max_sms_requests_per_month: FREE_LIMITS.smsRequestsPerMonth,
            max_link_requests_per_month: FREE_LIMITS.linkRequestsPerMonth,
        })
        .eq("id", organizationId);

    await admin
        .from("businesses")
        .update({ auto_reply_enabled: false, auto_reply_enabled_at: null })
        .eq("organization_id", organizationId);
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
            await clearOrganizationBillingAfterCancellation(admin, org.id);
            return;
        }

        const updateData = stripeSubscriptionToOrganizationUpdate(subscription);
        await admin.from("organizations").update(updateData).eq("id", org.id);
    } catch (e: unknown) {
        if (isStripeResourceMissing(e)) {
            await clearOrganizationBillingAfterCancellation(admin, org.id);
            return;
        }
        console.error("[reconcileOrganizationBillingFromStripe]", e);
    }
}
