import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BLOG_POSTS } from "@/lib/content/blog-data";
import { LOCALIZED_INDUSTRY_PAGES } from "@/lib/industries/localized-industries";
import { BlogCatalog } from "@/app/(marketing)/blog/blog-catalog";
import { industryAlternates } from "@/lib/seo/industry-alternates";

vi.mock("next/image", () => ({ default: () => null }));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => createElement("a", { href, ...props }, children) }));

describe("organic discovery", () => {
    it("exposes every published article as a link before any button interaction", () => {
        const html = renderToStaticMarkup(createElement(BlogCatalog, { posts: BLOG_POSTS }));
        for (const post of BLOG_POSTS) expect(html, post.slug).toContain(`href="/blog/${post.slug}"`);
    });

    it("returns matching English and Spanish alternates for actual translated industry pairs", () => {
        for (const page of LOCALIZED_INDUSTRY_PAGES) {
            const alternates = industryAlternates(page.industrySlug);
            expect(alternates.languages, page.industrySlug).toEqual({
                en: `https://www.zyenereviews.com/industries/${page.industrySlug}`,
                es: `https://www.zyenereviews.com/es/industries/${page.localizedSlug}`,
            });
            expect(alternates.canonical).toBe(`https://www.zyenereviews.com/industries/${page.industrySlug}`);
        }
    });
});
