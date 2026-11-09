import type Stripe from "stripe";

/**
 * Statuses after which a subscription no longer entitles (or bills) the org.
 * Matches the projection in organization-billing-sync and the checkout webhook.
 */
const TERMINAL_SUBSCRIPTION_STATUSES: ReadonlySet<Stripe.Subscription.Status> = new Set([
  "canceled",
  "unpaid",
  "incomplete_expired",
]);

export function isTerminalSubscriptionStatus(status: Stripe.Subscription.Status): boolean {
  return TERMINAL_SUBSCRIPTION_STATUSES.has(status);
}

/** True when Stripe says the requested object does not exist (HTTP 404, code resource_missing). */
export function isStripeResourceMissing(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "resource_missing";
}
