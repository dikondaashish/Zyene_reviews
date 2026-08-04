import type Stripe from "stripe";

import { logger } from "@/lib/logger";
import { stripe } from "@/services/stripe/client";
import { FREE_LIMITS } from "@/services/stripe/plans";
import { stripeSubscriptionToOrganizationUpdate } from "@/services/stripe/organization-billing-sync";
import { sendEmail } from "@/services/resend/send-email";
import { subscriptionCanceledEmail } from "@/services/resend/templates/subscription-canceled-email";

import { planLimitsToOrganizationColumns } from "./webhook-plan-columns";
import type { WebhookAdminClient } from "./webhook-types";

/**
 * current_period_end is not on Stripe.Subscription in the current API types,
 * but deleted-subscription payloads still carry it. Narrowed here rather than
 * cast to any.
 */
type DeletedSubscription = Stripe.Subscription & { current_period_end?: number };

/** Retrieves a customer, or null if missing/deleted/emailless. */
async function retrieveCustomerWithEmail(
    customerId: string,
): Promise<(Stripe.Customer & { email: string }) | null> {
    const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
    if (customer && !customer.deleted && customer.email) {
        return customer as Stripe.Customer & { email: string };
    }
    return null;
}

export async function handleSubscriptionUpdated(
    event: Stripe.Event,
    supabase: WebhookAdminClient,
) {
    const subscription = event.data.object as Stripe.Subscription;
    const previousAttributes = (event.data as { previous_attributes?: { status?: string } })
        .previous_attributes;
    const customerId =
        typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

    if (!customerId) {
        logger.error({ err: subscription.id }, "customer.subscription.updated: missing customer id");
        return;
    }

    await supabase
        .from("organizations")
        .update(stripeSubscriptionToOrganizationUpdate(subscription))
        .eq("stripe_customer_id", customerId);

    const convertedFromTrial =
        previousAttributes?.status === "trialing" && subscription.status === "active";
    if (!convertedFromTrial) return;

    try {
        const customer = await retrieveCustomerWithEmail(customerId);
        if (!customer) return;

        const { data: orgRow } = await supabase
            .from("organizations")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();
        if (!orgRow?.id) return;

        const { scheduleOnboardingDrip } = await import("@/lib/growth/schedule-growth-emails");
        await scheduleOnboardingDrip({
            email: customer.email,
            userName: customer.name || "there",
            organizationId: orgRow.id,
        });

        const { processReferralConversionReward } = await import("@/lib/growth/referral-rewards");
        await processReferralConversionReward(orgRow.id);
    } catch (dripErr) {
        logger.error({ err: dripErr }, "Error scheduling onboarding drip:");
    }
}

export async function handleSubscriptionDeleted(
    event: Stripe.Event,
    supabase: WebhookAdminClient,
) {
    const subscription = event.data.object as DeletedSubscription;
    const customerId = subscription.customer as string;

    const { data: canceledOrg } = await supabase
        .from("organizations")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

    await supabase
        .from("organizations")
        .update({
            plan: "free",
            plan_status: "canceled",
            stripe_subscription_id: null,
            trial_ends_at: null,
            ...planLimitsToOrganizationColumns(FREE_LIMITS),
        })
        .eq("stripe_customer_id", customerId);

    if (canceledOrg?.id) {
        await supabase
            .from("businesses")
            .update({ auto_reply_enabled: false, auto_reply_enabled_at: null })
            .eq("organization_id", canceledOrg.id);
    }

    try {
        const customer = await retrieveCustomerWithEmail(customerId);
        if (customer) {
            const endDate = subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
                : "the end of your billing period";

            await sendEmail({
                to: customer.email,
                subject: "Subscription Canceled - We're sorry to see you go",
                html: subscriptionCanceledEmail({
                    userName: customer.name || "there",
                    endDate,
                    rejoinUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/settings/billing`,
                }),
            });
        }
    } catch (emailErr) {
        logger.error({ err: emailErr }, "Error sending cancellation email:");
    }

    try {
        const customer = await retrieveCustomerWithEmail(customerId);
        if (customer) {
            const { scheduleWinbackFollowUp } = await import("@/lib/growth/schedule-growth-emails");
            await scheduleWinbackFollowUp({
                email: customer.email,
                userName: customer.name || "there",
                organizationId: canceledOrg?.id,
            });
        }
    } catch (winbackErr) {
        logger.error({ err: winbackErr }, "Error scheduling win-back sequence:");
    }
}
