import { describe, expect, it } from "vitest";

import {
    discoverUrlsViaLinks,
    discoverUrlsViaSitemap,
    type FetchText,
} from "../../src/services/aeo/crawler/discover-urls";

function fakeFetch(pages: Record<string, { ok: boolean; status?: number; text: string }>): FetchText {
    return async (url: string) => {
        const page = pages[url];
        if (!page) return null;
        return { ok: page.ok, status: page.status ?? (page.ok ? 200 : 404), text: page.text };
    };
}

describe("discoverUrlsViaSitemap", () => {
    it("returns null (not empty) when there is no sitemap at all — the signal to fall back", async () => {
        const fetchText = fakeFetch({});
        expect(await discoverUrlsViaSitemap("https://example.com", fetchText)).toBeNull();
    });

    it("returns an empty array, not null, for a sitemap that exists but lists nothing", async () => {
        const fetchText = fakeFetch({
            "https://example.com/sitemap.xml": {
                ok: true,
                text: '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
            },
        });
        expect(await discoverUrlsViaSitemap("https://example.com", fetchText)).toEqual([]);
    });

    it("extracts every <loc> from an ordinary sitemap", async () => {
        const fetchText = fakeFetch({
            "https://example.com/sitemap.xml": {
                ok: true,
                text:
                    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
                    "<url><loc>https://example.com/</loc></url>" +
                    "<url><loc>https://example.com/about</loc></url>" +
                    "</urlset>",
            },
        });
        expect(await discoverUrlsViaSitemap("https://example.com", fetchText)).toEqual([
            "https://example.com/",
            "https://example.com/about",
        ]);
    });

    it("follows a sitemap INDEX one level to collect pages from its child sitemaps", async () => {
        const fetchText = fakeFetch({
            "https://example.com/sitemap.xml": {
                ok: true,
                text:
                    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
                    "<sitemap><loc>https://example.com/sitemap-pages.xml</loc></sitemap>" +
                    "<sitemap><loc>https://example.com/sitemap-posts.xml</loc></sitemap>" +
                    "</sitemapindex>",
            },
            "https://example.com/sitemap-pages.xml": {
                ok: true,
                text: "<urlset><url><loc>https://example.com/</loc></url></urlset>",
            },
            "https://example.com/sitemap-posts.xml": {
                ok: true,
                text: "<urlset><url><loc>https://example.com/blog/1</loc></url></urlset>",
            },
        });
        expect(await discoverUrlsViaSitemap("https://example.com", fetchText)).toEqual([
            "https://example.com/",
            "https://example.com/blog/1",
        ]);
    });

    it("matches the real shape of wolfpackkc.com's sitemap.xml (checked 2026-08-09)", async () => {
        const fetchText = fakeFetch({
            "https://wolfpackkc.com/sitemap.xml": {
                ok: true,
                text:
                    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
                    "  <url>\n    <loc>https://wolfpackkc.com/drink-menu</loc>\n  </url>\n" +
                    "  <url>\n    <loc>https://wolfpackkc.com/</loc>\n  </url>\n" +
                    "</urlset>",
            },
        });
        const urls = await discoverUrlsViaSitemap("https://wolfpackkc.com", fetchText);
        expect(urls).toEqual(["https://wolfpackkc.com/drink-menu", "https://wolfpackkc.com/"]);
    });
});

describe("discoverUrlsViaLinks — the no-sitemap fallback", () => {
    it("discovers same-origin pages reachable from the homepage", async () => {
        const fetchHtml = fakeFetch({
            "https://example.com": {
                ok: true,
                text: '<a href="/about">About</a><a href="/menu">Menu</a>',
            },
            "https://example.com/about": { ok: true, text: "<p>About us</p>" },
            "https://example.com/menu": { ok: true, text: "<p>Our menu</p>" },
        });
        const urls = await discoverUrlsViaLinks("https://example.com", fetchHtml);
        expect(new Set(urls)).toEqual(
            new Set(["https://example.com", "https://example.com/about", "https://example.com/menu"])
        );
    });

    it("never follows a link to a different origin", async () => {
        const fetchHtml = fakeFetch({
            "https://example.com": {
                ok: true,
                text: '<a href="https://facebook.com/example">Facebook</a><a href="/about">About</a>',
            },
            "https://example.com/about": { ok: true, text: "<p>text</p>" },
        });
        const urls = await discoverUrlsViaLinks("https://example.com", fetchHtml);
        expect(urls.some((u) => u.includes("facebook.com"))).toBe(false);
    });

    it("skips anchors, mailto, and tel links — none of them are pages", async () => {
        const fetchHtml = fakeFetch({
            "https://example.com": {
                ok: true,
                text: '<a href="#top">Top</a><a href="mailto:x@example.com">Email</a><a href="tel:5551234">Call</a>',
            },
        });
        const urls = await discoverUrlsViaLinks("https://example.com", fetchHtml);
        expect(urls).toEqual(["https://example.com"]);
    });

    it("does not exceed the configured depth", async () => {
        // A chain: home -> a -> b -> c -> d. Depth 2 must reach b but not c.
        const fetchHtml = fakeFetch({
            "https://example.com": { ok: true, text: '<a href="/a">a</a>' },
            "https://example.com/a": { ok: true, text: '<a href="/b">b</a>' },
            "https://example.com/b": { ok: true, text: '<a href="/c">c</a>' },
            "https://example.com/c": { ok: true, text: '<a href="/d">d</a>' },
        });
        const urls = await discoverUrlsViaLinks("https://example.com", fetchHtml, { maxDepth: 2 });
        expect(urls).toContain("https://example.com/b");
        expect(urls).not.toContain("https://example.com/c");
    });

    it("does not revisit a page reachable by two different paths", async () => {
        const fetchHtml = fakeFetch({
            "https://example.com": {
                ok: true,
                text: '<a href="/a">a</a><a href="/b">b</a>',
            },
            "https://example.com/a": { ok: true, text: '<a href="/shared">shared</a>' },
            "https://example.com/b": { ok: true, text: '<a href="/shared">shared</a>' },
            "https://example.com/shared": { ok: true, text: "<p>text</p>" },
        });
        const urls = await discoverUrlsViaLinks("https://example.com", fetchHtml);
        expect(urls.filter((u) => u === "https://example.com/shared")).toHaveLength(1);
    });

    it("stops discovering once maxPages is reached, rather than exploring an unbounded site", async () => {
        const fetchHtml = fakeFetch({
            "https://example.com": {
                ok: true,
                text: Array.from({ length: 20 }, (_, i) => `<a href="/p${i}">p${i}</a>`).join(""),
            },
            ...Object.fromEntries(
                Array.from({ length: 20 }, (_, i) => [
                    `https://example.com/p${i}`,
                    { ok: true, text: "<p>text</p>" },
                ])
            ),
        });
        const urls = await discoverUrlsViaLinks("https://example.com", fetchHtml, { maxPages: 5 });
        expect(urls.length).toBeLessThanOrEqual(5);
    });
});
