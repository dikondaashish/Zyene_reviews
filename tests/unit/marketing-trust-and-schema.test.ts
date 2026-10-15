import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildOrganizationSchema } from "@/lib/seo/organization-schema";
import { WebSiteJsonLd } from "@/components/seo/json-ld-website";
import { CaseStudiesSlugHeaderSection } from "@/app/(marketing)/case-studies/[slug]/case-studies-slug-header-section";
import { CASE_STUDIES, CASE_STUDY_MAP } from "@/lib/social-proof/case-study-data";
import { HOME_TESTIMONIALS } from "@/components/marketing/marketing-home/home-testimonials";
import { MarketingHomeTestimonials } from "@/components/marketing/marketing-home/marketing-home-testimonials";

describe("organization and website schema", () => {
  it("includes alternateName ['ZyeneReviews', 'Zyene'] in Organization JSON-LD", () => {
    const org = buildOrganizationSchema();
    expect(org.alternateName).toEqual(["ZyeneReviews", "Zyene"]);
    expect(org).not.toHaveProperty("aggregateRating");
  });

  it("includes alternateName ['ZyeneReviews', 'Zyene'] in WebSite JSON-LD", () => {
    const markup = renderToStaticMarkup(createElement(WebSiteJsonLd));
    const jsonMatch = markup.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
    expect(jsonMatch).toBeTruthy();
    const parsed = JSON.parse(jsonMatch![1]);
    expect(parsed["@type"]).toBe("WebSite");
    expect(parsed.alternateName).toEqual(["ZyeneReviews", "Zyene"]);
    expect(parsed).not.toHaveProperty("aggregateRating");
  });
});

describe("homepage trust and testimonials", () => {
  it("contains no unverified testimonials by default", () => {
    expect(HOME_TESTIMONIALS).toEqual([]);
    const markup = renderToStaticMarkup(createElement(MarketingHomeTestimonials));
    expect(markup).toBe("");
  });
});

describe("case studies illustrative compliance", () => {
  it.each(CASE_STUDIES.map((s) => s.slug))(
    "ensures /case-studies/%s shows the illustrative notice and has illustrative in H1/subtitle",
    (slug) => {
      const study = CASE_STUDY_MAP[slug];
      const markup = renderToStaticMarkup(createElement(CaseStudiesSlugHeaderSection, { study }));

      // First screen visible disclaimer line
      expect(markup).toContain("Illustrative example based on typical results. Not a real customer.");

      // H1 contains "illustrative"
      expect(markup).toMatch(/<h1[^>]*>[\s\S]*?illustrative[\s\S]*?<\/h1>/i);

      // Subtitle contains "illustrative"
      expect(markup).toMatch(/<p[^>]*>[\s\S]*?illustrative[\s\S]*?<\/p>/i);

      // Confirm no Review, AggregateRating or Person-quote schema
      expect(markup).not.toContain("AggregateRating");
      expect(markup).not.toContain('"@type":"Review"');
      expect(markup).not.toContain('"@type": "Review"');
    }
  );
});
