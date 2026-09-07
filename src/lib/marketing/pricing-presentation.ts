import type { Plan } from "@/services/stripe/plan-catalog";

export const YEARLY_SAVINGS_LABEL = "Save 17%";

// Display-only equivalents. Billing amounts and reference prices remain in the plan catalog.
export function getPricingPresentation(plan: Pick<Plan, "price" | "originalPrice" | "interval">) {
  if (plan.price === null || plan.interval === null) return null;

  const yearly = plan.interval === "year";
  const monthlyPrice = yearly ? (plan.price / 12).toFixed(2).replace(/\.00$/, "") : plan.price.toFixed(2);
  const dailyAmount = yearly ? plan.price / 365 : Math.ceil(plan.price / 30);

  return {
    monthlyPrice: `$${monthlyPrice}`,
    referencePrice: !yearly && plan.originalPrice !== null ? `$${plan.originalPrice.toFixed(2)}` : null,
    annualCharge: yearly ? `$${plan.price.toFixed(2)}` : null,
    dailyPrefix: !yearly && dailyAmount > plan.price / 30 ? "Less than" : "Daily equivalent",
    dailyPrice: `$${yearly ? dailyAmount.toFixed(2) : dailyAmount}`,
    billingText: yearly ? `${YEARLY_SAVINGS_LABEL} · Cancel anytime.` : "Billed monthly. Cancel anytime.",
  };
}
