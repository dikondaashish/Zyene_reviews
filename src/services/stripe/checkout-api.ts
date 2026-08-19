import { createClient } from "@/lib/db/supabase/server";
import { stripe } from "@/services/stripe/client";
import { getPlanByPriceId, isPaidPlanTierDowngrade, isPaidPlanTierUpgrade, PLANS } from "@/services/stripe/plans";
import { isEligibleForIntroTrial } from "@/lib/stripe/checkout-trial-eligibility";
import { introTrialDaysForOrganization } from "@/lib/growth/referral";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { isOrganizationOwnerRole } from "@/lib/organization/organization-permissions";
import { loadActiveBillingMember } from "@/lib/billing/active-billing-member";

const checkoutSchema = z
  .object({
    priceId: z.string().min(1).max(120).optional(),
    planId: z.string().min(1).max(60).optional(),
    source: z.enum(["onboarding", "billing"]).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.priceId && !value.planId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "priceId or a valid planId is required",
      });
    }
  });

export async function handleBillingCheckout(request: Request) {
  const { logger, requestId } = createRequestLogger("POST /api/billing/checkout");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", { status: 401, details: requestId });
  }

  try {
    const parsed = checkoutSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "priceId or a valid planId is required", {
        status: 400,
        details: requestId,
      });
    }

    const { priceId: priceIdRaw, planId, source: sourceRaw } = parsed.data;
    const source = sourceRaw === "onboarding" ? "onboarding" : "billing";

    let priceId = priceIdRaw;
    if (!priceId && planId && typeof planId === "string") {
      const plan = PLANS.find((p) => p.id === planId);
      priceId = plan?.stripePriceId || undefined;
    }

    if (!priceId || typeof priceId !== "string") {
      return apiError("priceId or a valid planId is required", {
        status: 400,
        details: requestId,
      });
    }

    // Security: Validate priceId against known plans to prevent spoofing
    const validPriceIds = PLANS.reduce<string[]>((acc, p) => {
      if (p.stripePriceId) acc.push(p.stripePriceId);
      return acc;
    }, []);

    if (!validPriceIds.includes(priceId)) {
      return apiError("Invalid plan selected", {
        status: 400,
        details: requestId,
      });
    }

    const activeMembership = await loadActiveBillingMember(user.id);
    if (activeMembership.kind === "no-active-organization") {
      return apiError("No active organization found", {
        status: 404,
        details: requestId,
      });
    }
    const { admin, member } = activeMembership;

    if (!member) {
      return apiError("No organization found", {
        status: 404,
        details: requestId,
      });
    }

    const memberRole = member.role;
    if (!isOrganizationOwnerRole(memberRole)) {
      return apiError("You don't have permission to manage billing. Contact your organization owner.", {
        status: 403,
        details: requestId,
      });
    }

    const org = member.organizations;
    if (!org) {
      return apiError("Organization details not found", {
        status: 404,
        details: requestId,
      });
    }
    let stripeCustomerId = org.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: org.name,
        metadata: {
          organization_id: member.organization_id,
          supabase_user_id: user.id,
        },
      });
      stripeCustomerId = customer.id;

      await admin
        .from("organizations")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", member.organization_id);
    }

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const dashboardUrl = rootDomain.includes("localhost") ? `http://${rootDomain}` : `https://app.${rootDomain}`;

    const billingSuccessUrl = `${dashboardUrl}/settings/billing?success=true`;
    const billingCancelUrl = `${dashboardUrl}/settings/billing?canceled=true`;
    const onboardingSuccessUrl = `${dashboardUrl}/onboarding?checkout_success=1&session_id={CHECKOUT_SESSION_ID}`;
    const onboardingCancelUrl = `${dashboardUrl}/onboarding?checkout_canceled=1`;

    // ── Guard: If already subscribed, update plan instead of creating a new subscription ──
    if (org.stripe_subscription_id) {
      try {
        const existingSub = await stripe.subscriptions.retrieve(org.stripe_subscription_id);

        // Only update if the subscription is still active/trialing
        if (["active", "trialing", "past_due"].includes(existingSub.status)) {
          const currentItem = existingSub.items.data[0];
          if (!currentItem) {
            return apiError("Subscription has no billable items.", {
              status: 400,
              details: requestId,
            });
          }
          const currentPriceId = currentItem.price?.id;
          const currentPlan = currentPriceId ? getPlanByPriceId(currentPriceId) : null;
          const targetPlan = getPlanByPriceId(priceId);

          const endTrialForTierUpgrade =
            existingSub.status === "trialing" &&
            currentPlan &&
            targetPlan &&
            isPaidPlanTierUpgrade(currentPlan.id, targetPlan.id);

          const tierDowngrade = currentPlan && targetPlan && isPaidPlanTierDowngrade(currentPlan.id, targetPlan.id);

          await stripe.subscriptions.update(org.stripe_subscription_id, {
            items: [
              {
                id: currentItem.id,
                price: priceId,
              },
            ],
            // Downgrades: no immediate proration credit — change applies per Stripe schedule (standard SaaS).
            proration_behavior: tierDowngrade ? "none" : "create_prorations",
            ...(endTrialForTierUpgrade ? { trial_end: "now" } : {}),
          });

          const switchedReturnUrl =
            source === "onboarding"
              ? `${dashboardUrl}/onboarding?checkout_success=1&plan_switched=1`
              : billingSuccessUrl;
          logger.info(
            {
              userId: user.id,
              organizationId: member.organization_id,
              switched: true,
            },
            "Stripe subscription switched in-place",
          );

          return apiOk({
            url: switchedReturnUrl,
            switched: true,
            requestId,
          });
        }
      } catch (subError: unknown) {
        // If subscription retrieval fails (deleted, etc.), fall through to new checkout
        const message = subError instanceof Error ? subError.message : String(subError);
        logger.warn({ message }, "Could not update existing subscription, creating new checkout");
      }
    }

    // ── New subscription checkout ──
    const starterPriceIds = [process.env.STRIPE_STARTER_MONTHLY_PRICE_ID, process.env.STRIPE_STARTER_YEARLY_PRICE_ID];
    const proPriceIds = [process.env.STRIPE_PRO_MONTHLY_PRICE_ID, process.env.STRIPE_PRO_YEARLY_PRICE_ID];

    let couponId: string | undefined;
    if (starterPriceIds.includes(priceId)) {
      couponId = process.env.STRIPE_NEW_CUSTOMER_COUPON_ID;
    } else if (proPriceIds.includes(priceId)) {
      couponId = process.env.STRIPE_NEW_PRO_CUSTOMER_COUPON_ID;
    }

    const successUrl = source === "onboarding" ? onboardingSuccessUrl : billingSuccessUrl;
    const cancelUrl = source === "onboarding" ? onboardingCancelUrl : billingCancelUrl;

    const includeIntroTrial = await isEligibleForIntroTrial(stripeCustomerId);
    const trialDays = introTrialDaysForOrganization(org.referred_by_user_id);

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(couponId ? { discounts: [{ coupon: couponId }] } : { allow_promotion_codes: true }),
      ...(includeIntroTrial
        ? {
            subscription_data: {
              trial_period_days: trialDays,
              trial_settings: {
                end_behavior: {
                  missing_payment_method: "cancel",
                },
              },
            },
          }
        : {}),
      metadata: {
        organization_id: member.organization_id,
      },
    });

    logger.info({ userId: user.id, organizationId: member.organization_id, source }, "Stripe checkout session created");
    return apiOk({ url: session.url, requestId });
  } catch (error: unknown) {
    logger.error({ err: error }, "Checkout Error");
    Sentry.captureException(error, { tags: { route: "billing-checkout" } });
    return apiError("Failed to create checkout session. Please try again.", {
      status: 500,
      details: requestId,
    });
  }
}
