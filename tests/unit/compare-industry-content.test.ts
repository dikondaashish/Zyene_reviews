import { describe, expect, it } from "vitest";
import { COMPETITORS } from "@/lib/comparisons/competitor-data";
import { COMPETITOR_FACT_SHEETS, VERIFIED_COMPETITOR_FACTS } from "@/lib/comparisons/verified-competitor-facts";
import { FEATURE_PILLAR_MAP } from "@/lib/growth/feature-pillars";
import { INDUSTRIES } from "@/lib/industries/industry-data";
import { INDUSTRY_PAGE_CONTENT, getIndustrySlugsForPillar } from "@/lib/industries/industry-page-content";

const GATING = /only (happy|satisfied|positive)|filter (out )?(negative|unhappy)|before (they|it) (reach|hit)s? google|keep (bad|negative) reviews off/i;

function unique(values: string[]): boolean {
  return new Set(values).size === values.length;
}

describe("competitor compare pages", () => {
  it("each page has 3-5 sourced differences, 4-6 FAQs and its own copy", () => {
    for (const c of COMPETITORS) {
      expect(c.differences.length, c.slug).toBeGreaterThanOrEqual(3);
      expect(c.differences.length, c.slug).toBeLessThanOrEqual(5);
      for (const d of c.differences) expect(d.source.href, `${c.slug}: ${d.topic}`).toMatch(/^https:\/\//);
      expect(c.faqs.length, c.slug).toBeGreaterThanOrEqual(4);
      expect(c.faqs.length, c.slug).toBeLessThanOrEqual(6);
      expect(c.pricingSource.checkedOn, c.slug).toMatch(/2026/);
      expect(c.switching.steps.length, c.slug).toBeGreaterThanOrEqual(3);
      expect(c.pickCompetitorInstead, c.slug).toContain(c.name);
    }
    expect(unique(COMPETITORS.map((c) => c.heroSub))).toBe(true);
    expect(unique(COMPETITORS.map((c) => c.openingSummary))).toBe(true);
    expect(unique(COMPETITORS.map((c) => c.visual.key))).toBe(true);
  });

  it("keeps titles and descriptions within SEO limits", () => {
    for (const c of COMPETITORS) {
      expect(c.metaTitle.length, c.slug).toBeLessThanOrEqual(60);
      expect(c.metaDescription.length, c.slug).toBeLessThanOrEqual(160);
    }
  });

  it("shares one fact source with the blog comparison table", () => {
    for (const [slug, facts] of Object.entries(VERIFIED_COMPETITOR_FACTS)) {
      expect(COMPETITOR_FACT_SHEETS[slug]).toBe(facts);
      const page = COMPETITORS.find((c) => c.slug === slug);
      expect(page?.price).toBe(facts.price);
    }
  });

  it("does not leave 'Confirm' or 'Ask sales' placeholder cells", () => {
    for (const c of COMPETITORS) {
      for (const row of c.quickTable) expect(String(row.competitor), c.slug).not.toMatch(/^(Confirm|Ask sales)/);
    }
  });
});

describe("industry pages", () => {
  it("every industry has page content with distinct headings", () => {
    for (const industry of INDUSTRIES) {
      expect(INDUSTRY_PAGE_CONTENT[industry.slug], industry.slug).toBeDefined();
    }
    const contents = Object.values(INDUSTRY_PAGE_CONTENT);
    for (const key of ["pain", "solve", "useCase", "pricing", "faq"] as const) {
      expect(unique(contents.map((c) => c.headings[key])), key).toBe(true);
    }
  });

  it("each industry has 3-5 FAQs and 2-3 valid feature links", () => {
    for (const [slug, content] of Object.entries(INDUSTRY_PAGE_CONTENT)) {
      expect(content.faqs.length, slug).toBeGreaterThanOrEqual(3);
      expect(content.faqs.length, slug).toBeLessThanOrEqual(5);
      expect(content.relatedPillars.length, slug).toBeGreaterThanOrEqual(2);
      expect(content.relatedPillars.length, slug).toBeLessThanOrEqual(3);
      for (const pillar of content.relatedPillars) expect(FEATURE_PILLAR_MAP[pillar], `${slug}: ${pillar}`).toBeDefined();
    }
  });

  it("matches visuals to the industry", () => {
    expect(INDUSTRY_PAGE_CONTENT.restaurants.lead.visual.kind).toBe("qr-poster");
    expect(INDUSTRY_PAGE_CONTENT.dental.lead.visual.kind).toBe("reviewed-drafts");
    expect(INDUSTRY_PAGE_CONTENT.medical.lead.visual.kind).toBe("reviewed-drafts");
    for (const trade of ["hvac", "plumbing", "electricians"]) {
      expect(INDUSTRY_PAGE_CONTENT[trade].lead.visual.kind, trade).toBe("job-webhook");
    }
  });

  it("links automatic-reply leads to the automatic replies page", () => {
    for (const content of Object.values(INDUSTRY_PAGE_CONTENT)) {
      if (content.lead.visual.kind === "auto-reply") expect(content.lead.link.href).toBe("/features/automatic-review-replies");
    }
  });

  it("cross-links feature pages back to industries", () => {
    expect(getIndustrySlugsForPillar("qr-code-reviews")).toContain("restaurants");
  });

  it("has no review-gating language", () => {
    const text = JSON.stringify([INDUSTRY_PAGE_CONTENT, COMPETITORS]);
    expect(text).not.toMatch(GATING);
  });
});
