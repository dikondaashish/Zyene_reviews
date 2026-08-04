import { describe, expect, it } from "vitest";
import { buildGrowthPageInventory, summarizePageInventory } from "../../src/lib/growth/page-inventory";
import { BLOG_SLUGS } from "../../src/lib/content/blog-data";
import { INDUSTRY_SLUGS } from "../../src/lib/industries/industry-data";

describe("growth page inventory", () => {
    const pages = buildGrowthPageInventory();

    it("includes all blueprint P0 conversion routes", () => {
        const paths = new Set(pages.map((p) => p.path));
        expect(paths.has("/pricing")).toBe(true);
        expect(paths.has("/features")).toBe(true);
        expect(paths.has("/reset-password")).toBe(true);
        expect(paths.has("/compare/birdeye")).toBe(true);
        expect(paths.has("/features/review-collection")).toBe(true);
    });

    it("includes dynamic blog and industry slugs", () => {
        const paths = new Set(pages.map((p) => p.path));
        for (const slug of INDUSTRY_SLUGS) {
            expect(paths.has(`/industries/${slug}`)).toBe(true);
        }
        for (const slug of BLOG_SLUGS.slice(0, 3)) {
            expect(paths.has(`/blog/${slug}`)).toBe(true);
        }
    });

    it("uses case-studies not customers for trust pages", () => {
        const paths = pages.map((p) => p.path);
        expect(paths.some((p) => p.startsWith("/case-studies"))).toBe(true);
    });

    it("summarizes live and sitemap counts", () => {
        const summary = summarizePageInventory(pages);
        expect(summary.total).toBeGreaterThan(140);
        expect(summary.live).toBeGreaterThan(summary.inSitemap);
    });
});
