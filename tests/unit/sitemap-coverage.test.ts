import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getAllSitemapEntries, getCoreSitemap, getSupportSitemap, SITEMAP_SECTION_IDS } from "../../src/lib/seo/sitemap";
import { INDUSTRY_SLUGS } from "../../src/lib/industries/industry-data";
import { COMPETITOR_SLUGS } from "../../src/lib/comparisons/competitor-data";
import { FEATURE_PILLAR_SLUGS } from "../../src/lib/growth/feature-pillars";
import { FREE_TOOLS } from "../../src/lib/free-tools/free-tools-data";
import { RESOURCE_GUIDES } from "../../src/lib/content/resource-data";
import { BLOG_POSTS } from "../../src/lib/content/blog-data";
import { CASE_STUDY_SLUGS } from "../../src/lib/social-proof/case-study-data";
import {
    HELP_ARTICLE_MAP,
    HELP_CATEGORY_SLUGS,
    helpArticleNestedPath,
} from "../../src/lib/content/help-data";
import { LOCALIZED_INDUSTRY_PAGES } from "../../src/lib/industries/localized-industries";

/**
 * Guards organic traffic on an SEO-led product.
 *
 * src/lib/seo/sitemap.ts is a hand-maintained route manifest. Adding a marketing
 * page without adding it here is silent — the page just never gets submitted for
 * indexing, and nothing fails. This test closes that gap by walking the actual
 * route tree on disk and asserting every indexable static page is present.
 *
 * A page is exempt only if it opts out via `robots: { index: false }` in its own
 * metadata, which is the same signal crawlers honour.
 */

const MARKETING_ROOT = path.join(process.cwd(), "src/app/(marketing)");

/** Route segment groups `(like-this)` and parallel routes don't affect the URL. */
function isIgnoredSegment(segment: string): boolean {
    return segment.startsWith("(") || segment.startsWith("@") || segment.startsWith("_");
}

/** Collects static page.tsx routes; skips dynamic `[param]` segments. */
function collectStaticRoutes(dir: string, urlParts: string[] = [], acc: Array<{ url: string; file: string }> = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (entry.name.includes("[")) continue; // dynamic — covered by its data source
            collectStaticRoutes(full, isIgnoredSegment(entry.name) ? urlParts : [...urlParts, entry.name], acc);
        } else if (entry.name === "page.tsx") {
            acc.push({ url: `/${urlParts.join("/")}`.replace(/\/+$/, "") || "/", file: full });
        }
    }
    return acc;
}

/** True when the page opts out of indexing in its own exported metadata. */
function optsOutOfIndexing(file: string): boolean {
    const src = fs.readFileSync(file, "utf8");
    return /robots:[\s\S]*?\{[^}]*index:\s*false/.test(src);
}

function isRedirectUrl(pathname: string): boolean {
    const knownRedirects = [
        "/product",
        "/customers",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
    ];
    if (knownRedirects.includes(pathname)) return true;
    if (pathname !== "/" && pathname.endsWith("/")) return true;
    return false;
}

function routeExists(pathname: string): boolean {
    const cleanPath = pathname.replace(/\/+$/, "") || "/";
    const segments = cleanPath === "/" ? [] : cleanPath.slice(1).split("/");

    if (cleanPath === "/") {
        return fs.existsSync(path.join(process.cwd(), "src/app/(marketing)/page.tsx"));
    }

    const directMarketingPath = path.join(
        process.cwd(),
        "src/app/(marketing)",
        ...segments,
        "page.tsx",
    );
    if (fs.existsSync(directMarketingPath)) return true;

    if (segments[0] === "docs") {
        const docSubSegments = segments.slice(1);
        const docsPath = path.join(process.cwd(), "src/app/docs", ...docSubSegments, "page.tsx");
        if (fs.existsSync(docsPath)) return true;
    }

    if (segments[0] === "compare" && segments.length === 2) {
        return (
            COMPETITOR_SLUGS.includes(segments[1]) &&
            fs.existsSync(
                path.join(process.cwd(), "src/app/(marketing)/compare/[competitor]/page.tsx"),
            )
        );
    }

    if (segments[0] === "industries" && segments.length === 2) {
        return (
            INDUSTRY_SLUGS.includes(segments[1]) &&
            fs.existsSync(
                path.join(process.cwd(), "src/app/(marketing)/industries/[industry]/page.tsx"),
            )
        );
    }

    if (segments[0] === "features" && segments.length === 2) {
        return (
            FEATURE_PILLAR_SLUGS.includes(segments[1] as (typeof FEATURE_PILLAR_SLUGS)[number]) &&
            fs.existsSync(path.join(process.cwd(), "src/app/(marketing)/features/[pillar]/page.tsx"))
        );
    }

    if (segments[0] === "tools" && segments.length === 2) {
        return (
            FREE_TOOLS.some((t) => t.slug === segments[1]) &&
            (fs.existsSync(
                path.join(process.cwd(), "src/app/(marketing)/tools", segments[1], "page.tsx"),
            ) ||
                fs.existsSync(path.join(process.cwd(), "src/app/(marketing)/tools/[tool]/page.tsx")))
        );
    }

    if (segments[0] === "resources" && segments.length === 2) {
        return (
            RESOURCE_GUIDES.some((g) => g.slug === segments[1]) &&
            fs.existsSync(path.join(process.cwd(), "src/app/(marketing)/resources/[guide]/page.tsx"))
        );
    }

    if (segments[0] === "blog" && segments.length === 2) {
        return (
            BLOG_POSTS.some((p) => p.slug === segments[1]) &&
            fs.existsSync(path.join(process.cwd(), "src/app/(marketing)/blog/[slug]/page.tsx"))
        );
    }

    if (segments[0] === "case-studies" && segments.length === 2) {
        return (
            CASE_STUDY_SLUGS.includes(segments[1]) &&
            fs.existsSync(
                path.join(process.cwd(), "src/app/(marketing)/case-studies/[slug]/page.tsx"),
            )
        );
    }

    if (segments[0] === "help") {
        if (segments.length === 2) {
            return (
                HELP_CATEGORY_SLUGS.includes(segments[1] as (typeof HELP_CATEGORY_SLUGS)[number]) &&
                fs.existsSync(path.join(process.cwd(), "src/app/(marketing)/help/[slug]/page.tsx"))
            );
        }
        if (segments.length === 3) {
            return (
                Object.values(HELP_ARTICLE_MAP).some(
                    (a) => helpArticleNestedPath(a) === cleanPath,
                ) &&
                fs.existsSync(
                    path.join(
                        process.cwd(),
                        "src/app/(marketing)/help/[slug]/[article]/page.tsx",
                    ),
                )
            );
        }
    }

    if (segments[0] === "es" && segments[1] === "industries" && segments.length === 3) {
        return (
            LOCALIZED_INDUSTRY_PAGES.some((p) => p.localizedSlug === segments[2]) &&
            fs.existsSync(
                path.join(process.cwd(), "src/app/(marketing)/es/industries/[industry]/page.tsx"),
            )
        );
    }

    return false;
}

describe("sitemap coverage", () => {
    const routes = collectStaticRoutes(MARKETING_ROOT);
    const entries = getAllSitemapEntries();
    const sitemapPaths = new Set(
        entries.map((e) => {
            const p = new URL(e.url).pathname.replace(/\/+$/, "");
            return p === "" ? "/" : p;
        }),
    );

    it("finds marketing routes and sitemap entries to compare", () => {
        expect(routes.length).toBeGreaterThan(20);
        expect(entries.length).toBeGreaterThan(routes.length);
    });

    it("lists every indexable static marketing page", () => {
        const indexable = routes.filter((r) => !optsOutOfIndexing(r.file));
        const missing = indexable.filter((r) => !sitemapPaths.has(r.url)).map((r) => r.url);

        expect(
            missing,
            `These marketing pages are indexable but absent from src/lib/seo/sitemap.ts, so they will not be submitted for indexing. Add them there, or set robots: { index: false } if they are intentionally private:\n  ${missing.join("\n  ")}`,
        ).toEqual([]);
    });

    it("does not list pages that opted out of indexing", () => {
        const optedOut = routes.filter((r) => optsOutOfIndexing(r.file));
        const wronglyListed = optedOut.filter((r) => sitemapPaths.has(r.url)).map((r) => r.url);

        expect(
            wronglyListed,
            `These pages set robots: { index: false } but are still in the sitemap, which sends crawlers a contradictory signal:\n  ${wronglyListed.join("\n  ")}`,
        ).toEqual([]);
    });

    it("emits no duplicate URLs", () => {
        const urls = entries.map((e) => e.url);
        const dupes = [...new Set(urls.filter((u, i) => urls.indexOf(u) !== i))];
        expect(dupes, `Duplicate sitemap URLs:\n  ${dupes.join("\n  ")}`).toEqual([]);
    });

    it("every URL in active sitemaps maps to a real route and does not redirect", () => {
        const sitemaps = [
            { name: "core", entries: getCoreSitemap() },
            { name: "support", entries: getSupportSitemap() },
        ];

        for (const { name, entries: list } of sitemaps) {
            expect(list.length).toBeGreaterThan(0);
            for (const item of list) {
                const pathname = new URL(item.url).pathname;
                expect(
                    isRedirectUrl(pathname),
                    `Sitemap ${name} contains redirect URL: ${pathname}`,
                ).toBe(false);
                expect(
                    routeExists(pathname),
                    `Sitemap ${name} contains non-existent route: ${pathname}`,
                ).toBe(true);
            }
        }
    });
    it("excludes the /es/industries hub and all /es/industries/* pages from the sitemaps", () => {
        expect(sitemapPaths.has("/es/industries")).toBe(false);
        for (const p of LOCALIZED_INDUSTRY_PAGES) {
            expect(sitemapPaths.has(`/es/industries/${p.localizedSlug}`)).toBe(false);
        }
    });

    it("does not include an es sitemap section in SITEMAP_SECTION_IDS or generateStaticParams", async () => {
        expect(SITEMAP_SECTION_IDS).toEqual(["core", "support"]);
        expect(SITEMAP_SECTION_IDS).not.toContain("es");

        const { generateStaticParams } = await import("../../src/app/sitemap/[file]/route");
        expect(generateStaticParams()).toEqual([{ file: "core.xml" }, { file: "support.xml" }]);
    });

    it("sitemap index route contains core and support but no es entry", async () => {
        const { GET } = await import("../../src/app/sitemap.xml/route");
        const res = GET();
        const xml = await res.text();
        expect(xml).toContain("/sitemap/core.xml");
        expect(xml).toContain("/sitemap/support.xml");
        expect(xml).not.toContain("es.xml");
        expect(xml).not.toContain("/sitemap/es");
    });

    it("Spanish industry detail pages have no hreflang alternates pointing back to English", async () => {
        const { generateMetadata } = await import(
            "../../src/app/(marketing)/es/industries/[industry]/page"
        );
        for (const p of LOCALIZED_INDUSTRY_PAGES) {
            const meta = await generateMetadata({
                params: Promise.resolve({ industry: p.localizedSlug }),
            });
            expect(meta.robots).toEqual({ index: false, follow: true });
            expect(meta.alternates?.canonical).toBe(
                `https://www.zyenereviews.com/es/industries/${p.localizedSlug}`,
            );
            expect(meta.alternates?.languages).toBeUndefined();
        }
    });

    it("verifies existence and redirect status for audited candidate paths", () => {
        // Real pages that exist and do not redirect
        expect(routeExists("/industries/hvac")).toBe(true);
        expect(isRedirectUrl("/industries/hvac")).toBe(false);

        expect(routeExists("/docs/plugins")).toBe(true);
        expect(isRedirectUrl("/docs/plugins")).toBe(false);

        // Root industry paths do not exist (they live at /industries/*) and do not redirect
        expect(routeExists("/plumbing")).toBe(false);
        expect(routeExists("/electricians")).toBe(false);
        expect(routeExists("/hotels")).toBe(false);
        expect(routeExists("/salons")).toBe(false);

        expect(isRedirectUrl("/plumbing")).toBe(false);
        expect(isRedirectUrl("/electricians")).toBe(false);
        expect(isRedirectUrl("/hotels")).toBe(false);
        expect(isRedirectUrl("/salons")).toBe(false);

        // Their real location under /industries/* exists and does not redirect
        expect(routeExists("/industries/plumbing")).toBe(true);
        expect(routeExists("/industries/electricians")).toBe(true);
        expect(routeExists("/industries/hotels")).toBe(true);
        expect(routeExists("/industries/salons")).toBe(true);
    });
});
