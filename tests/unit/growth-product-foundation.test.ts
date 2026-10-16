import { describe, expect, it } from "vitest";
import {
    PRODUCT_PILLARS,
    POSITIONING,
    NEGATIVE_FEEDBACK_SHIELD,
} from "../../src/lib/growth/product-foundation";
import {
    FEATURE_PILLARS,
    FEATURE_PILLAR_SLUGS,
    resolveFeaturePillarSlug,
} from "../../src/lib/growth/feature-pillars";

describe("product foundation", () => {
    it("defines 10 product pillars", () => {
        expect(PRODUCT_PILLARS).toHaveLength(10);
    });

    it("includes Negative Feedback Shield marketing copy", () => {
        expect(NEGATIVE_FEEDBACK_SHIELD.steps.length).toBeGreaterThanOrEqual(4);
    });

    it("has positioning one-liner", () => {
        expect(POSITIONING.oneLiner.length).toBeGreaterThan(20);
        expect(POSITIONING.pillars).toHaveLength(3);
    });
});

describe("feature pillars", () => {
    it("exposes one page per product feature, including the blueprint six", () => {
        expect(FEATURE_PILLAR_SLUGS).toHaveLength(17);
        expect(new Set(FEATURE_PILLAR_SLUGS).size).toBe(FEATURE_PILLAR_SLUGS.length);
        for (const slug of ["review-monitoring", "ai-replies", "review-collection", "competitor-tracking", "local-seo", "analytics"]) {
            expect(FEATURE_PILLAR_SLUGS).toContain(slug);
        }
    });

    it("keeps every feature page's meta title and description within SEO limits", () => {
        for (const page of FEATURE_PILLARS) {
            expect(page.metaTitle.length, page.slug).toBeLessThanOrEqual(44);
            expect(page.metaDescription.length, page.slug).toBeLessThanOrEqual(160);
        }
    });

    it("resolves legacy competitor-intelligence slug", () => {
        expect(resolveFeaturePillarSlug("competitor-intelligence")).toBe("competitor-tracking");
    });
});
