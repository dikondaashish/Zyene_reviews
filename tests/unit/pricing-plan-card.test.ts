import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PricingClientPlanCard } from "@/components/marketing/pricing-client-plan-card";
import { PLAN_MAP } from "@/services/stripe/plan-catalog";

describe("pricing card destinations", () => {
  it.each(["starter_monthly", "starter_yearly", "professional_monthly", "professional_yearly"])(
    "preserves the supplied signup URL and its tracking parameters for %s",
    (id) => {
      const html = renderToStaticMarkup(
        createElement(PricingClientPlanCard, {
          plan: PLAN_MAP[id],
          isPopular: id.startsWith("professional"),
          signupUrl: "/signup?ref=partner&utm_source=pricing&next=%2Fdashboard",
        }),
      );
      expect(html).toContain('href="/signup?ref=partner&amp;utm_source=pricing&amp;next=%2Fdashboard"');
      expect(html).toContain("Start 7-day free trial");
    },
  );

  it("keeps Enterprise on the existing demo route", () => {
    const html = renderToStaticMarkup(
      createElement(PricingClientPlanCard, {
        plan: PLAN_MAP.enterprise,
        isPopular: false,
        signupUrl: "/signup?ref=partner",
      }),
    );
    expect(html).toContain('href="/demo"');
    expect(html).toContain("Talk to sales");
    expect(html).not.toContain("/day");
  });
});
