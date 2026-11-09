import * as Sentry from "@sentry/nextjs";
import type Stripe from "stripe";

import { logger } from "@/lib/logger";
import { stripe } from "@/services/stripe/client";
import { getPlanByPriceId } from "@/services/stripe/plans";
import { isStripeResourceMissing, isTerminalSubscriptionStatus } from "@/services/stripe/subscription-status";

type DuplicateCheck = {
  organizationId: string;
  customerId: string;
  sessionId: string;
  existingSubscriptionId: string;
  checkoutSubscriptionId: string;
};

/**
 * Returns true when the org's stored subscription is still live, so the
 * completed checkout must not replace it. If the checkout's own subscription
 * is live too, the customer is now paying twice: alert loudly (with both ids
 * for a manual refund) instead of acknowledging the event silently. Neither
 * subscription is cancelled automatically.
 */
export async function existingSubscriptionStillLive(check: DuplicateCheck): Promise<boolean> {
  let current: Stripe.Subscription;
  try {
    current = await stripe.subscriptions.retrieve(check.existingSubscriptionId);
  } catch (error: unknown) {
    if (isStripeResourceMissing(error)) return false;
    throw error;
  }
  if (isTerminalSubscriptionStatus(current.status)) return false;

  const created = await stripe.subscriptions.retrieve(check.checkoutSubscriptionId);
  if (isTerminalSubscriptionStatus(created.status)) return true;

  const details = { ...check, existingStatus: current.status, checkoutStatus: created.status };
  logger.error(
    details,
    "Duplicate live Stripe subscription: checkout created a second subscription while the organization already has one. Refund and cancel the duplicate manually.",
  );
  Sentry.captureMessage("Duplicate live Stripe subscription for organization", {
    level: "error",
    tags: { webhook: "checkout.session.completed", billing: "duplicate_subscription" },
    extra: details,
  });
  return true;
}

const LIVE_STATUSES: ReadonlySet<Stripe.Subscription.Status> = new Set(["active", "trialing", "past_due"]);

/**
 * True for a subscription this app made for this org: tagged with its organization_id
 * (every checkout since Oct 2026), or untagged (older checkouts) on a catalog plan price.
 * Another org's subscriptions on a shared customer, and dashboard-made ones on
 * off-catalog prices (add-ons, enterprise), are never touched or alerted on.
 */
function belongsToOrgPlan(sub: Stripe.Subscription, organizationId: string): boolean {
  const tagged = sub.metadata?.organization_id;
  if (tagged) return tagged === organizationId;
  return sub.items.data.some((item) => Boolean(item.price?.id && getPlanByPriceId(item.price.id)));
}

/**
 * Runs after a checkout subscription is bound to the org and its credit granted. Looks
 * at the customer's OTHER plan subscriptions for this org in Stripe (not the stored
 * binding, which the billing page reconcile clears for `unpaid` without cancelling):
 * - `unpaid`: re-checked, then cancelled. Paying its open dunning invoice would otherwise
 *   revive it to `active` and bill the customer twice. Its deletion event no longer
 *   matches the org binding, so no cancellation or win-back mail goes out.
 * - active / trialing / past_due: a second live subscription. Alerted for a manual
 *   refund, never cancelled automatically.
 * Throws on Stripe errors so the event is retried; everything before it is idempotent.
 */
export async function settleOtherCustomerSubscriptions(check: {
  organizationId: string;
  customerId: string;
  sessionId: string;
  keepSubscriptionId: string;
}): Promise<void> {
  const others = await stripe.subscriptions.list({ customer: check.customerId, status: "all", limit: 100 });
  for (const sub of others.data) {
    if (sub.id === check.keepSubscriptionId || !belongsToOrgPlan(sub, check.organizationId)) continue;
    if (sub.status === "unpaid") {
      await replaceUnpaidSubscription(sub.id, check);
      continue;
    }
    // A retry after the cancel landed but voiding failed: finish voiding what we cancelled.
    if (sub.status === "canceled" && sub.cancellation_details?.comment === replacedComment(check)) {
      await voidOpenInvoices(sub.id);
      continue;
    }
    if (LIVE_STATUSES.has(sub.status)) {
      const details = { ...check, otherSubscriptionId: sub.id, otherStatus: sub.status };
      logger.error(details, "Customer has another live Stripe subscription after checkout. Refund and cancel it manually.");
      Sentry.captureMessage("Duplicate live Stripe subscription for organization", {
        level: "error",
        tags: { webhook: "checkout.session.completed", billing: "duplicate_subscription" },
        extra: details,
      });
    }
  }
}

function replacedComment(check: { keepSubscriptionId: string; sessionId: string }): string {
  return `Replaced by ${check.keepSubscriptionId} at checkout ${check.sessionId}`;
}

/**
 * Re-reads the status right before acting, so a subscription paid a moment ago is kept.
 * Cancels FIRST, then voids its open invoices: cancelling only stops automatic
 * collection, so the old dunning invoice stayed payable for a subscription that no longer
 * exists. Voiding before cancelling is unsafe: voiding a delinquent subscription's latest
 * invoice can move it back to `active` (Stripe docs), and it would then keep billing.
 * A canceled subscription is terminal, so voiding afterwards cannot revive it.
 */
async function replaceUnpaidSubscription(subscriptionId: string, check: { keepSubscriptionId: string; sessionId: string }) {
  try {
    const current = await stripe.subscriptions.retrieve(subscriptionId);
    if (current.status !== "unpaid") return;
    await stripe.subscriptions.cancel(subscriptionId, { cancellation_details: { comment: replacedComment(check) } });
    logger.info({ ...check, canceledSubscriptionId: subscriptionId }, "Canceled unpaid subscription replaced at checkout");
  } catch (error: unknown) {
    if (!isStripeResourceMissing(error)) throw error;
    return;
  }
  await voidOpenInvoices(subscriptionId);
}

/** Voids every open invoice of a subscription we just cancelled (the owner chose to write the old debt off). */
async function voidOpenInvoices(subscriptionId: string): Promise<void> {
  const open = await stripe.invoices.list({ subscription: subscriptionId, status: "open", limit: 100 });
  for (const invoice of open.data) {
    if (!invoice.id) continue;
    await stripe.invoices.voidInvoice(invoice.id);
    logger.info({ subscriptionId, invoiceId: invoice.id }, "Voided open invoice of a replaced unpaid subscription");
  }
}
