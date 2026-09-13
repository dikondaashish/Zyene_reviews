import { describe, expect, it, vi } from "vitest";
import { BLOG_POSTS } from "@/lib/content/blog-data";
import { RESOURCE_GUIDES } from "@/lib/content/resource-data";
import { headingAnchor } from "@/lib/content/heading-anchor";
import { buildMarketingMetadata } from "@/lib/seo/marketing-page-metadata";
import { buildPricingProductSchema } from "@/lib/seo/pricing-json-ld";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

const request = vi.hoisted(() => ({ host: "www.zyenereviews.com" }));
vi.mock("next/headers", () => ({
    headers: async () => new Headers({ host: request.host }),
}));

describe("public SEO integrity", () => {
    it("lets crawlers render public pages while keeping private routes excluded", async () => {
        request.host = "www.zyenereviews.com";
        const result = await robots();
        const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
        const general = rules.find((rule) => rule.userAgent === "*")!;
        const blocked = [general.disallow].flat().filter(Boolean) as string[];
        for (const resource of ["/_next/static/chunks/app.js", "/_next/image", "/favicon_io/favicon.ico"]) {
            expect(blocked.some((prefix) => resource.startsWith(prefix))).toBe(false);
        }
        expect(blocked).toContain("/dashboard");
        expect(blocked).toContain("/api/");
        expect(result.sitemap).toContain("/sitemap.xml");
    });

    it.each(["app.zyenereviews.com", "auth.zyenereviews.com"])("keeps %s private", async (host) => {
        request.host = host;
        const result = await robots();
        expect(result.rules).toEqual(expect.arrayContaining([expect.objectContaining({ disallow: expect.arrayContaining(["/"]) })]));
    });

    it("keeps every resource table-of-contents link attached to a real heading", () => {
        for (const resource of RESOURCE_GUIDES) {
            const ids = resource.body.filter((section) => section.type === "h2").map(headingAnchor);
            for (const item of resource.tableOfContents) {
                expect(ids, `${resource.slug}#${item.anchor}`).toContain(item.anchor);
            }
        }
        expect(headingAnchor({ text: "Can you remove a customer's review?" })).toBe("can-you-remove-a-customer-s-review");
    });

    it("uses real blog modification dates instead of the crawl time", () => {
        const entries = sitemap();
        for (const post of BLOG_POSTS) {
            expect(entries.find((entry) => entry.url.endsWith(`/blog/${post.slug}`))?.lastModified)
                .toBe(post.dateModified ?? post.publishedAt);
        }
        expect(entries.find((entry) => entry.url.endsWith("/pricing"))?.lastModified).toBeUndefined();
    });

    it("retains a canonical when language alternates are supplied", () => {
        const metadata = buildMarketingMetadata({ title: "Reviews", description: "Manage reviews.", path: "/features",
            alternates: { languages: { en: "/features" } } });
        expect(metadata.alternates?.canonical).toMatch(/\/features$/);
        expect(metadata.openGraph?.images).toBeTruthy();
    });

    it("publishes an image and priced offers without inventing an Enterprise price", () => {
        const schema = buildPricingProductSchema();
        expect(schema.image).toEqual([expect.stringContaining("/og/og-default.png")]);
        expect(schema.offers).toHaveLength(2);
        for (const offer of schema.offers as Array<{ price: string }>) {
            expect(Number(offer.price)).toBeGreaterThan(0);
        }
    });

    it("keeps article descriptions concise and linked pages in the sitemap", () => {
        const paths = new Set(sitemap().map((entry) => new URL(entry.url).pathname));
        for (const post of BLOG_POSTS) {
            expect(post.metaDescription.length, post.slug).toBeLessThanOrEqual(160);
            for (const slug of post.relatedSlugs) {
                expect(paths.has(`/blog/${slug}`), `${post.slug}: related ${slug}`).toBe(true);
            }
            for (const link of post.internalLinks) {
                if (link.href.startsWith("/") && link.href !== "/signup") {
                    expect(paths.has(link.href.split("#")[0]), `${post.slug}: ${link.href}`).toBe(true);
                }
            }
        }
    });
});
