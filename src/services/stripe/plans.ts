/**
 * Stripe plans — barrel re-export.
 *
 * Split into what a plan *is* (plan-catalog) and what it *unlocks*
 * (plan-entitlements). Existing `@/services/stripe/plans` imports keep working.
 */

export * from "./plan-catalog";
export * from "./plan-entitlements";
