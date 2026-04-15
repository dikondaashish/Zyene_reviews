import { describe, expect, it } from "vitest";
import { planAllowsPublicReviewWidget } from "../../src/services/stripe/plans";

describe("planAllowsPublicReviewWidget", () => {
  it("allows Stripe plan ids like starter_monthly with active status", () => {
    expect(planAllowsPublicReviewWidget("starter_monthly", "active")).toBe(true);
    expect(planAllowsPublicReviewWidget("professional_yearly", "trialing")).toBe(true);
  });

  it("rejects display-name-only short list (regression: embed used to check starter not starter_monthly)", () => {
    expect(planAllowsPublicReviewWidget("starter", "active")).toBe(true);
    expect(planAllowsPublicReviewWidget("enterprise", "active")).toBe(true);
  });

  it("rejects free or inactive", () => {
    expect(planAllowsPublicReviewWidget("starter_monthly", "canceled")).toBe(false);
    expect(planAllowsPublicReviewWidget("free", "active")).toBe(false);
    expect(planAllowsPublicReviewWidget(null, "active")).toBe(false);
  });
});
