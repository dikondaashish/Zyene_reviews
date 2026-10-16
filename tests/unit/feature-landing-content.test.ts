import { describe, expect, it } from "vitest";
import { FEATURE_LANDING_CONTENT } from "../../src/components/marketing/feature-landing/content";
import { FEATURE_PILLAR_SLUGS } from "../../src/lib/growth/feature-pillars";

describe("feature landing pages", () => {
    it("has a page body for every feature slug", () => {
        for (const slug of FEATURE_PILLAR_SLUGS) {
            expect(FEATURE_LANDING_CONTENT[slug], slug).toBeDefined();
            expect(FEATURE_LANDING_CONTENT[slug].slug).toBe(slug);
        }
    });

    it("links related features that exist and are not the page itself", () => {
        for (const slug of FEATURE_PILLAR_SLUGS) {
            const { related } = FEATURE_LANDING_CONTENT[slug];
            expect(related.length, slug).toBeGreaterThanOrEqual(2);
            for (const target of related) {
                expect(FEATURE_PILLAR_SLUGS, `${slug} → ${target}`).toContain(target);
                expect(target).not.toBe(slug);
            }
        }
    });

    it("gives every page a flow, story rows and FAQs for structured data", () => {
        for (const slug of FEATURE_PILLAR_SLUGS) {
            const page = FEATURE_LANDING_CONTENT[slug];
            expect(page.flow.steps.length, slug).toBeGreaterThanOrEqual(3);
            expect(page.rows.length, slug).toBeGreaterThanOrEqual(2);
            expect(page.faqs.length, slug).toBeGreaterThanOrEqual(4);
            expect(new Set(page.faqs.map((f) => f.question)).size, slug).toBe(page.faqs.length);
        }
    });
});
