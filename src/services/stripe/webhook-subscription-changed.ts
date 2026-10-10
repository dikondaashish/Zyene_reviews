import { appEmailUrl } from "@/lib/email/app-email-url";
import type Stripe from "stripe";

import { logger } from "@/lib/logger";
import { stripe } from "@/services/stripe/client";
import { stripeSubscriptionToOrganizationUpdate } from "@/services/stripe/organization-billing-sync";
import { applySubscriptionProjection, canceledBillingProjection } from "@/services/stripe/subscription-projection";
import { sendEmail } from "@/services/resend/send-email";
import { subscriptionCanceledEmail } from "@/services/resend/templates/subscription-canceled-email";

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
    const eventSubscription = event.data.object as Stripe.Subscription;
    const observedAt = new Date().toISOString();
    // Delayed events are notifications, not the authoritative billing snapshot.
    const subscription = await stripe.subscriptions.retrieve(eventSubscription.id);
    const previousAttributes = (event.data as { previous_attributes?: { status?: string } })
        .previous_attributes;
    const customerId =
        typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

    if (!customerId) {
        throw new Error("Subscription customer missing");
    }

    const updatedOrgId = await applySubscriptionProjection(supabase, customerId, subscription.id,
        stripeSubscriptionToOrganizationUpdate(subscription), { observedAt });
    if (!updatedOrgId) return;

    const convertedFromTrial =
        previousAttributes?.status === "trialing" && subscription.status === "active";
    if (!convertedFromTrial) return;

    const { processReferralConversionReward } = await import("@/lib/growth/referral-rewards");
    await processReferralConversionReward(updatedOrgId);
    try {
        const customer = await retrieveCustomerWithEmail(customerId);
        if (customer) {
            const { scheduleOnboardingDrip } = await import("@/lib/growth/schedule-growth-emails");
            await scheduleOnboardingDrip({
                email: customer.email,
                userName: customer.name || "there",
                organizationId: updatedOrgId,
            });
        }
    } catch (dripErr) {
        logger.error({ err: dripErr }, "Error scheduling onboarding drip:");
    }
}

export async function handleSubscriptionDeleted(
    event: Stripe.Event,
    supabase: WebhookAdminClient,
) {
    const subscription = event.data.object as DeletedSubscription;
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
    if (!customerId) throw new Error("Subscription customer missing");
    const canceledOrgId = await applySubscriptionProjection(supabase, customerId, subscription.id,
        canceledBillingProjection(), { clear: true });
    if (!canceledOrgId) return; // An old subscription must not cancel its replacement.

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
                    rejoinUrl: appEmailUrl("/settings/billing"),
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
                organizationId: canceledOrgId,
            });
        }
    } catch (winbackErr) {
        logger.error({ err: winbackErr }, "Error scheduling win-back sequence:");
    }
}
