import * as Sentry from "@sentry/nextjs";
import type { Logger } from "pino";
import type Stripe from "stripe";

import { stripe } from "@/services/stripe/client";
import { getPlanByPriceId, isPaidPlanTierDowngrade, isPaidPlanTierUpgrade } from "@/services/stripe/plans";
import { isStripeResourceMissing, isTerminalSubscriptionStatus } from "@/services/stripe/subscription-status";

const SWITCHABLE_STATUSES: ReadonlySet<Stripe.Subscription.Status> = new Set(["active", "trialing", "past_due"]);

export type PlanSwitchResult =
  | { kind: "switched" }
  /** The stored subscription is gone for good, so a fresh Checkout cannot double-bill. */
  | { kind: "no-live-subscription" }
  | { kind: "failed"; status: number; code: string; message: string };

function isStripeCardError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "type" in error && error.type === "StripeCardError";
}

function switchFailed(error: unknown, subscriptionId: string, stage: string, logger: Logger): PlanSwitchResult {
  if (isStripeCardError(error)) {
    logger.warn({ err: error, subscriptionId, stage }, "Plan switch declined by the card on file");
    return {
      kind: "failed",
      status: 402,
      code: "plan_switch_payment_failed",
      message: "Your card was declined while switching plans. Update your payment method in Billing and try again.",
    };
  }
  logger.error({ err: error, subscriptionId, stage }, "Plan switch failed; not starting a second checkout");
  Sentry.captureException(error, { tags: { route: "billing-checkout", stage }, extra: { subscriptionId } });
  return {
    kind: "failed",
    status: 503,
    code: "plan_switch_failed",
    message: "We couldn't change your plan right now. Please try again in a moment.",
  };
}

/**
 * Moves the org's existing subscription to `priceId` in place. Only reports
 * "no-live-subscription" when Stripe confirms the subscription is missing or
 * terminal; any other failure must not fall through to a new Checkout, which
 * would leave the customer paying for two live subscriptions.
 */
export async function switchExistingSubscriptionPlan(
  subscriptionId: string,
  priceId: string,
  logger: Logger,
): Promise<PlanSwitchResult> {
  let existingSub: Stripe.Subscription;
  try {
    existingSub = await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error: unknown) {
    if (!isStripeResourceMissing(error)) return switchFailed(error, subscriptionId, "retrieve", logger);
    logger.warn({ subscriptionId }, "Stored Stripe subscription no longer exists; starting a new checkout");
    return { kind: "no-live-subscription" };
  }

  // `unpaid` counts as gone here. It is NOT cancelled before Checkout: that would send the
  // cancellation/win-back mail to someone buying, and lose the old subscription if they
  // abandon Checkout. The checkout webhook cancels it once the new one is bound.
  if (isTerminalSubscriptionStatus(existingSub.status)) return { kind: "no-live-subscription" };
  if (!SWITCHABLE_STATUSES.has(existingSub.status)) {
    logger.warn({ subscriptionId, status: existingSub.status }, "Existing subscription cannot be switched yet");
    return {
      kind: "failed",
      status: 409,
      code: "subscription_not_switchable",
      message: "Your current subscription is still being set up or is paused. Manage it from Billing before changing plans.",
    };
  }

  const currentItem = existingSub.items.data[0];
  if (!currentItem) {
    return { kind: "failed", status: 400, code: "subscription_without_items", message: "Subscription has no billable items." };
  }
  const currentPriceId = currentItem.price?.id;
  const currentPlan = currentPriceId ? getPlanByPriceId(currentPriceId) : null;
  const targetPlan = getPlanByPriceId(priceId);
  const endTrialForTierUpgrade =
    existingSub.status === "trialing" && currentPlan && targetPlan && isPaidPlanTierUpgrade(currentPlan.id, targetPlan.id);
  const tierDowngrade = currentPlan && targetPlan && isPaidPlanTierDowngrade(currentPlan.id, targetPlan.id);

  try {
    await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: currentItem.id, price: priceId }],
      // Downgrades: no immediate proration credit - change applies per Stripe schedule (standard SaaS).
      proration_behavior: tierDowngrade ? "none" : "create_prorations",
      ...(endTrialForTierUpgrade ? { trial_end: "now" } : {}),
    });
  } catch (error: unknown) {
    return switchFailed(error, subscriptionId, "update", logger);
  }
  return { kind: "switched" };
}
