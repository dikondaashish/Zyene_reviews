import { appEmailUrl } from "@/lib/email/app-email-url";
import * as Sentry from "@sentry/nextjs";
import type Stripe from "stripe";

import { logger } from "@/lib/logger";
import { stripe } from "@/services/stripe/client";
import { getPlanByPriceId } from "@/services/stripe/plans";
import { stripeSubscriptionToOrganizationUpdate } from "@/services/stripe/organization-billing-sync";
import { applySubscriptionProjection } from "@/services/stripe/subscription-projection";
import { sendEmail } from "@/services/resend/send-email";
import { subscriptionSuccessEmail } from "@/services/resend/templates/subscription-success-email";

import { isNfcCheckoutSession } from "@/lib/nfc/checkout-session";
import { fulfillNfcCheckout } from "@/services/nfc/fulfill-checkout";

import type { WebhookAdminClient } from "./webhook-types";

/** Post-checkout growth notifications are best-effort and deduplicated by sequence. */
async function runPostCheckoutGrowth(
    subscription: Stripe.Subscription,
    session: Stripe.Checkout.Session,
    organizationId: string,
) {
    const email = session.customer_details?.email;
    const userName = session.customer_details?.name || "there";

    if (subscription.status === "trialing" && email) {
        try {
            const { scheduleTrialNurture } = await import("@/lib/growth/schedule-growth-emails");
            await scheduleTrialNurture({ email, userName, organizationId });
        } catch (nurtureErr) {
            logger.error({ err: nurtureErr }, "Error scheduling trial nurture:");
        }
        return;
    }

    if (subscription.status === "active") {
        try {
            if (email) {
                const { scheduleOnboardingDrip } = await import("@/lib/growth/schedule-growth-emails");
                await scheduleOnboardingDrip({ email, userName, organizationId });
            }
        } catch (dripErr) {
            logger.error({ err: dripErr }, "Error scheduling onboarding drip (direct paid)");
        }
    }
}

export async function handleCheckoutSessionCompleted(
    event: Stripe.Event,
    supabase: WebhookAdminClient,
) {
    const session = event.data.object as Stripe.Checkout.Session;

    if (isNfcCheckoutSession(session)) {
        await fulfillNfcCheckout(session, supabase);
        return;
    }

    if (!session.subscription) {
        logger.info({ sessionId: session.id }, "Ignoring non-subscription checkout session");
        return;
    }

    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    const organizationId = session.metadata?.organization_id;

    if (!organizationId) {
        logger.error("No organization_id in checkout session metadata");
        Sentry.captureMessage("Stripe checkout session missing organization_id metadata", {
            level: "error",
            extra: { session_id: session.id },
        });
        throw new Error("Checkout organization metadata missing");
    }

    // The stored customer binding is required even for signed metadata.
    const { data: existingOrg, error: orgLookupError } = await supabase
        .from("organizations")
        .select("stripe_subscription_id, stripe_customer_id")
        .eq("id", organizationId)
        .single();

    if (orgLookupError || !existingOrg) {
        throw orgLookupError ?? new Error("Checkout organization not found");
    }

    if (!customerId || existingOrg.stripe_customer_id !== customerId) throw new Error("Checkout customer mismatch");
    if (existingOrg.stripe_subscription_id && existingOrg.stripe_subscription_id !== subscriptionId) {
        try {
            const current = await stripe.subscriptions.retrieve(existingOrg.stripe_subscription_id);
            if (!["canceled", "unpaid", "incomplete_expired"].includes(current.status)) return;
        } catch (error) {
            if (!(typeof error === "object" && error && "code" in error && error.code === "resource_missing")) throw error;
        }
    }

    const observedAt = new Date().toISOString();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subscriptionCustomer = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
    if (subscriptionCustomer !== customerId) throw new Error("Subscription customer mismatch");
    if (["canceled", "unpaid", "incomplete_expired"].includes(subscription.status)) return;
    const priceId = subscription.items.data[0]?.price?.id;

    if (!priceId) {
        logger.error("No price ID found in subscription");
        Sentry.captureMessage("Stripe checkout subscription missing price ID", {
            level: "error",
            extra: { subscription_id: subscription.id },
        });
        throw new Error("Checkout subscription price missing");
    }

    const plan = getPlanByPriceId(priceId);
    if (!plan) throw new Error("Unrecognized checkout subscription price");
    const updatedOrgId = await applySubscriptionProjection(supabase, customerId, subscriptionId,
        stripeSubscriptionToOrganizationUpdate(subscription), { bindOrganizationId: organizationId,
            expectedSubscriptionId: existingOrg.stripe_subscription_id, observedAt });
    if (!updatedOrgId) return;

    // Financial writes must succeed before the event can be acknowledged.
    // The receipt makes retries safe even when the org binding already landed.
    const { resetAeoCreditsForPlan } = await import("@/services/aeo/billing/renewal-credit-reset");
    await resetAeoCreditsForPlan(supabase, { organizationId, planId: plan.id,
        customerId, subscriptionId, receiptId: `checkout:${session.id}`,
        periodEnd: subscription.items.data[0]?.current_period_end });
    if (subscription.status === "active") {
        const { processReferralConversionReward } = await import("@/lib/growth/referral-rewards");
        await processReferralConversionReward(organizationId);
    }

    try {
        const customerEmail = session.customer_details?.email;
        if (customerEmail) {
            const isTrial = subscription.status === "trialing";
            const planName = plan?.name || "Starter";

            await sendEmail({
                to: customerEmail,
                idempotencyKey: `stripe-checkout:${session.id}`,
                subject: isTrial
                    ? `Your ${planName} trial has started!`
                    : `Welcome to the ${planName} plan!`,
                html: subscriptionSuccessEmail({
                    userName: session.customer_details?.name || "there",
                    planName,
                    isTrial,
                    dashboardUrl: appEmailUrl("/dashboard"),
                }),
            });
        }
    } catch (emailErr) {
        logger.error({ err: emailErr }, "Error sending subscription success email:");
        Sentry.captureException(emailErr, {
            extra: { organizationId, eventType: "checkout.session.completed" },
        });
    }

    await runPostCheckoutGrowth(subscription, session, organizationId);
}
