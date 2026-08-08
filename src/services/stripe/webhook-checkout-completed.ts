import * as Sentry from "@sentry/nextjs";
import type Stripe from "stripe";

import { logger } from "@/lib/logger";
import { stripe } from "@/services/stripe/client";
import { getPlanByPriceId, type PlanLimits } from "@/services/stripe/plans";
import { sendEmail } from "@/services/resend/send-email";
import { subscriptionSuccessEmail } from "@/services/resend/templates/subscription-success-email";

import { planLimitsToOrganizationColumns } from "./webhook-plan-columns";
import type { WebhookAdminClient } from "./webhook-types";

const FALLBACK_LIMITS: PlanLimits = {
    maxLocations: 1,
    emailRequestsPerMonth: 500,
    smsRequestsPerMonth: 500,
    linkRequestsPerMonth: 1500,
    smartRepliesPerMonth: 1500,
    teamMembers: 5,
};

function planStatusFor(subStatus: Stripe.Subscription.Status): string {
    if (subStatus === "trialing") return "trialing";
    if (subStatus === "past_due") return "past_due";
    if (subStatus === "canceled" || subStatus === "unpaid") return "canceled";
    return "active";
}

/** Post-checkout growth emails and referral credit — every step is non-fatal. */
async function runPostCheckoutGrowth(
    subscription: Stripe.Subscription,
    session: Stripe.Checkout.Session,
    organizationId: string,
) {
    const email = session.customer_details?.email;
    if (!email) return;
    const userName = session.customer_details?.name || "there";

    if (subscription.status === "trialing") {
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
            const { scheduleOnboardingDrip } = await import("@/lib/growth/schedule-growth-emails");
            await scheduleOnboardingDrip({ email, userName, organizationId });
        } catch (dripErr) {
            logger.error({ err: dripErr }, "Error scheduling onboarding drip (direct paid)");
        }
        try {
            const { processReferralConversionReward } = await import("@/lib/growth/referral-rewards");
            await processReferralConversionReward(organizationId);
        } catch (refErr) {
            logger.error({ err: refErr }, "Error processing referral reward:");
        }
    }
}

export async function handleCheckoutSessionCompleted(
    event: Stripe.Event,
    supabase: WebhookAdminClient,
) {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    const organizationId = session.metadata?.organization_id;

    if (!organizationId) {
        logger.error("No organization_id in checkout session metadata");
        Sentry.captureMessage("Stripe checkout session missing organization_id metadata", {
            level: "error",
            extra: { session_id: session.id },
        });
        return;
    }

    // Idempotency: Skip if this subscription is already linked
    const { data: existingOrg } = await supabase
        .from("organizations")
        .select("stripe_subscription_id")
        .eq("id", organizationId)
        .single();

    if (existingOrg?.stripe_subscription_id === subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price?.id;

    if (!priceId) {
        logger.error("No price ID found in subscription");
        Sentry.captureMessage("Stripe checkout subscription missing price ID", {
            level: "error",
            extra: { subscription_id: subscription.id },
        });
        return;
    }

    const plan = getPlanByPriceId(priceId);
    const limits = plan?.limits || FALLBACK_LIMITS;

    const trialEndsAt =
        subscription.status === "trialing" && subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null;

    await supabase
        .from("organizations")
        .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan: plan?.id || "starter_monthly",
            plan_status: planStatusFor(subscription.status),
            trial_ends_at: trialEndsAt,
            ...planLimitsToOrganizationColumns(limits),
        })
        .eq("id", organizationId);

    // Isolated on purpose, like the growth steps below: a bug in this newer,
    // less-proven feature must never block the org record above or the
    // welcome email that follows, which real customers rely on today.
    try {
        const { resetAeoCreditsForPlan } = await import("@/services/aeo/billing/renewal-credit-reset");
        await resetAeoCreditsForPlan(supabase, { organizationId, planId: plan?.id || "starter_monthly" });
    } catch (creditErr) {
        logger.error({ err: creditErr }, "[AEO] E-9 initial credit grant failed on checkout");
    }

    try {
        const customerEmail = session.customer_details?.email;
        if (customerEmail) {
            const isTrial = subscription.status === "trialing";
            const planName = plan?.name || "Starter";

            await sendEmail({
                to: customerEmail,
                subject: isTrial
                    ? `Your ${planName} trial has started!`
                    : `Welcome to the ${planName} plan!`,
                html: subscriptionSuccessEmail({
                    userName: session.customer_details?.name || "there",
                    planName,
                    isTrial,
                    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/dashboard`,
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
