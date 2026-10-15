import { describe, expect, it } from "vitest";
import { COMPETITOR_MAP } from "@/lib/comparisons/competitor-data";
import { BLOG_POST_MAP } from "@/lib/content/blog-data";
import { RESOURCE_MAP } from "@/lib/content/resource-data";
import { metadata as agenciesMetadata } from "@/app/(marketing)/agencies/page";
import { metadata as enterpriseMetadata } from "@/app/(marketing)/enterprise/page";
import { metadata as reviewLinkGenMetadata } from "@/app/(marketing)/tools/review-link-generator/page";

const TITLE_SUFFIX = " | Zyene Reviews";

function renderTitle(rawTitle: string): string {
  return `${rawTitle}${TITLE_SUFFIX}`;
}

describe("rendered marketing page titles", () => {
  const listedRoutes: Array<{ route: string; getRawTitle: () => string; expectedRaw: string }> = [
    {
      route: "/compare/birdeye",
      getRawTitle: () => COMPETITOR_MAP.birdeye.metaTitle,
      expectedRaw: "Birdeye Alternative: Zyene vs Birdeye (2026)",
    },
    {
      route: "/compare/nicejob",
      getRawTitle: () => COMPETITOR_MAP.nicejob.metaTitle,
      expectedRaw: "NiceJob Alternative: Zyene vs NiceJob (2026)",
    },
    {
      route: "/compare/podium",
      getRawTitle: () => COMPETITOR_MAP.podium.metaTitle,
      expectedRaw: "Podium Alternative: Zyene vs Podium (2026)",
    },
    {
      route: "/compare/gatherup",
      getRawTitle: () => COMPETITOR_MAP.gatherup.metaTitle,
      expectedRaw: "GatherUp Alternative: Zyene vs GatherUp",
    },
    {
      route: "/blog/birdeye-alternatives-for-local-businesses",
      getRawTitle: () => BLOG_POST_MAP["birdeye-alternatives-for-local-businesses"].metaTitle,
      expectedRaw: "Birdeye Alternatives Compared (2026)",
    },
    {
      route: "/resources/local-seo-checklist",
      getRawTitle: () => RESOURCE_MAP["local-seo-checklist"].metaTitle,
      expectedRaw: "Local SEO Checklist 2026: 40+ Tasks",
    },
    {
      route: "/resources/negative-review-templates",
      getRawTitle: () => RESOURCE_MAP["negative-review-templates"].metaTitle,
      expectedRaw: "20+ Negative Review Response Templates",
    },
    {
      route: "/tools/review-link-generator",
      getRawTitle: () => String(reviewLinkGenMetadata.title),
      expectedRaw: "Free Google Review Link Generator",
    },
    {
      route: "/blog/how-to-respond-to-a-1-star-review",
      getRawTitle: () => BLOG_POST_MAP["how-to-respond-to-a-1-star-review"].metaTitle,
      expectedRaw: "Respond to a 1-Star Review (5 Templates)",
    },
    {
      route: "/blog/how-to-handle-fake-google-reviews",
      getRawTitle: () => BLOG_POST_MAP["how-to-handle-fake-google-reviews"].metaTitle,
      expectedRaw: "How to Handle Fake Google Reviews",
    },
    {
      route: "/blog/can-you-delete-a-google-review",
      getRawTitle: () => BLOG_POST_MAP["can-you-delete-a-google-review"].metaTitle,
      expectedRaw: "Delete or Remove a Google Review? (2026)",
    },
    {
      route: "/blog/how-to-respond-to-a-positive-review",
      getRawTitle: () => BLOG_POST_MAP["how-to-respond-to-a-positive-review"].metaTitle,
      expectedRaw: "Positive Review Responses (15 Examples)",
    },
    {
      route: "/agencies",
      getRawTitle: () => String(agenciesMetadata.title),
      expectedRaw: "White-Label Review Management for Agencies",
    },
    {
      route: "/enterprise",
      getRawTitle: () => String(enterpriseMetadata.title),
      expectedRaw: "Multi-Location Review Management Software",
    },
  ];

  it.each(listedRoutes)(
    "ensures rendered title for $route does not exceed 60 characters",
    ({ getRawTitle, expectedRaw }) => {
      const rawTitle = getRawTitle();
      expect(rawTitle).toBe(expectedRaw);

      const renderedTitle = renderTitle(rawTitle);
      expect(renderedTitle.length).toBeLessThanOrEqual(60);
    }
  );

  it("confirms protected blog and resource titles were not modified", () => {
    expect(BLOG_POST_MAP["how-to-get-a-google-review-link"].metaTitle).toBe(
      "How to Get a Google Review Link and QR Code (2026)"
    );
    expect(RESOURCE_MAP["google-reviews-guide"].metaTitle).toBe(
      "Google Reviews Guide for Local Businesses (2026)"
    );
  });
});
