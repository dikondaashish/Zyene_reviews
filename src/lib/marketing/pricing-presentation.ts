import type { Plan } from "@/services/stripe/plan-catalog";

export const YEARLY_SAVINGS_LABEL = "Save 17%";

// Formats the plan catalog's approved display equivalents and exact billing amounts.
export function getPricingPresentation(
  plan: Pick<Plan, "price" | "originalPrice" | "dailyEquivalent" | "interval">,
) {
  if (plan.price === null || plan.dailyEquivalent === null || plan.interval === null) return null;

  const yearly = plan.interval === "year";
  const monthlyPrice = yearly ? (plan.price / 12).toFixed(2).replace(/\.00$/, "") : plan.price.toFixed(2);

  return {
    monthlyPrice: `$${monthlyPrice}`,
    referencePrice: !yearly && plan.originalPrice !== null ? `$${plan.originalPrice.toFixed(2)}` : null,
    annualCharge: yearly ? `$${plan.price.toFixed(2)}` : null,
    dailyPrefix: "Daily equivalent",
    dailyPrice: `$${plan.dailyEquivalent.toFixed(2)}`,
    billingText: yearly ? `${YEARLY_SAVINGS_LABEL} · Cancel anytime.` : "Billed monthly. Cancel anytime.",
  };
}
