import { describe, expect, it } from "vitest";
import { PLAN_MAP } from "@/services/stripe/plan-catalog";
import { getPricingPresentation } from "@/lib/marketing/pricing-presentation";

describe("marketing pricing presentation", () => {
  it.each([
    ["starter_monthly", "$29.99", "$0.99", "$49.99"],
    ["professional_monthly", "$59.99", "$1.98", "$89.99"],
  ])("keeps the actual monthly charge and catalog reference for %s", (id, monthly, daily, reference) => {
    expect(getPricingPresentation(PLAN_MAP[id])).toMatchObject({
      monthlyPrice: monthly,
      dailyPrice: daily,
      dailyPrefix: "Daily equivalent",
      referencePrice: reference,
      annualCharge: null,
      billingText: "Billed monthly. Cancel anytime.",
    });
  });

  it.each([
    ["starter_yearly", "$25", "$299.99", "$0.82"],
    ["professional_yearly", "$50", "$599.99", "$1.64"],
  ])("derives rounded equivalents and retains the exact annual charge for %s", (id, monthly, annual, daily) => {
    expect(getPricingPresentation(PLAN_MAP[id])).toMatchObject({
      monthlyPrice: monthly,
      annualCharge: annual,
      dailyPrice: daily,
      dailyPrefix: "Daily equivalent",
      referencePrice: null,
      billingText: "Save 17% · Cancel anytime.",
    });
  });

  it("does not fabricate a reference price when the catalog has none", () => {
    expect(
      getPricingPresentation({ ...PLAN_MAP.professional_monthly, originalPrice: null })?.referencePrice,
    ).toBeNull();
  });

  it("keeps Enterprise non-numeric", () => {
    expect(getPricingPresentation(PLAN_MAP.enterprise)).toBeNull();
  });

  it("derives billing amounts from the supplied plan without mutating it", () => {
    const plan = { ...PLAN_MAP.starter_yearly, price: 365, originalPrice: null, dailyEquivalent: 1 };
    const before = structuredClone(plan);
    expect(getPricingPresentation(plan)).toMatchObject({ annualCharge: "$365.00", dailyPrice: "$1.00" });
    expect(plan).toEqual(before);
  });
});
