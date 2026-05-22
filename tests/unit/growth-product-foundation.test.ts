import { describe, expect, it } from "vitest";
import {
    PRODUCT_PILLARS,
    POSITIONING,
    NEGATIVE_FEEDBACK_SHIELD,
} from "../../src/lib/growth/product-foundation";
import {
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
    it("exposes six blueprint feature URLs", () => {
        expect(FEATURE_PILLAR_SLUGS).toEqual([
            "review-monitoring",
            "ai-replies",
            "review-collection",
            "competitor-tracking",
            "local-seo",
            "analytics",
        ]);
    });

    it("resolves legacy competitor-intelligence slug", () => {
        expect(resolveFeaturePillarSlug("competitor-intelligence")).toBe("competitor-tracking");
    });
});
