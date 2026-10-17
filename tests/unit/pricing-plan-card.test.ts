import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PricingClientPlanCard } from "@/components/marketing/pricing-client-plan-card";
import { getPlanHighlights } from "@/lib/marketing/pricing-plan-highlights";
import { PLAN_MATRIX } from "@/lib/marketing/pricing-plan-matrix";
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

describe("pricing card highlights", () => {
  it.each(Object.keys(PLAN_MAP))("keeps %s to five or six grouped highlights", (id) => {
    const highlights = getPlanHighlights(PLAN_MAP[id]);
    expect(highlights.length).toBeGreaterThanOrEqual(5);
    expect(highlights.length).toBeLessThanOrEqual(6);
  });

  it("derives allowance numbers from plan limits", () => {
    expect(getPlanHighlights(PLAN_MAP.starter_monthly).join(" ")).toContain("500 email and 500 SMS");
    expect(getPlanHighlights(PLAN_MAP.professional_monthly).join(" ")).toContain("700 email and 700 SMS");
  });

  it("keeps the daily equivalent on the card after the checklist was shortened", () => {
    const html = renderToStaticMarkup(
      createElement(PricingClientPlanCard, { plan: PLAN_MAP.starter_monthly, isPopular: false, signupUrl: "/signup" }),
    );
    expect(html).toContain("/day");
    expect(html.match(/<li/g)?.length).toBe(getPlanHighlights(PLAN_MAP.starter_monthly).length);
  });

  it("lists every plan feature group in the comparison matrix", () => {
    expect(PLAN_MATRIX.map((group) => group.title)).toEqual([
      "Locations and team",
      "Monthly allowances",
      "Collect and respond",
      "Insights and integrations",
      "Support and security",
    ]);
    expect(PLAN_MATRIX.every((group) => group.rows.every((row) => row.values.length === 3))).toBe(true);
  });
});
