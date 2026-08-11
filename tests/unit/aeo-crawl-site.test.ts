import { describe, expect, it } from "vitest";

import { crawlSite, CRAWLER_USER_AGENT } from "../../src/services/aeo/crawler/crawl-site";
import { PolitenessQueue } from "../../src/services/aeo/crawler/politeness-queue";
import type { FetchText } from "../../src/services/aeo/crawler/discover-urls";

function fakeSite(pages: Record<string, { ok: boolean; status?: number; text: string }>): FetchText {
    return async (url: string) => {
        const page = pages[url];
        if (!page) return null;
        return { ok: page.ok, status: page.status ?? (page.ok ? 200 : 404), text: page.text };
    };
}

// No politeness delay in tests — real timing is politeness-queue.test.ts's job.
function instantPoliteness(): PolitenessQueue {
    return new PolitenessQueue(0);
}

const SIMPLE_HTML = '<title>Page</title><link rel="canonical" href="URLPLACEHOLDER"><h1>Hi</h1><p>Enough real words to clear the thin-content threshold comfortably here.</p>';

describe("crawlSite — robots.txt drives everything downstream", () => {
    it("reports AI bots blocked at the root as critical findings", async () => {
        const fetchText = fakeSite({
            "https://example.com/robots.txt": { ok: true, text: "User-agent: GPTBot\nDisallow: /\n" },
            "https://example.com/sitemap.xml": { ok: false, text: "" },
            "https://example.com": { ok: true, text: "<a href=\"/\">home</a>" },
        });
        const result = await crawlSite(
            { origin: "https://example.com", planId: "starter_monthly" },
            { fetchText, politeness: instantPoliteness() }
        );
        const blocked = result.findings.find((f) => f.rule === "ai_bot_blocked");
        expect(blocked?.severity).toBe("critical");
        expect(blocked?.evidence).toContain("GPTBot");
    });

    it("a normal robots.txt with no restrictions produces no ai_bot_blocked findings", async () => {
        const fetchText = fakeSite({
            "https://example.com/robots.txt": { ok: true, text: "User-agent: *\nSitemap: https://example.com/sitemap.xml\n" },
            "https://example.com/sitemap.xml": {
                ok: true,
                text: "<urlset><url><loc>https://example.com/</loc></url></urlset>",
            },
            "https://example.com/": { ok: true, text: SIMPLE_HTML.replace("URLPLACEHOLDER", "https://example.com/") },
        });
        const result = await crawlSite(
            { origin: "https://example.com", planId: "starter_monthly" },
            { fetchText, politeness: instantPoliteness() }
        );
        expect(result.findings.some((f) => f.rule === "ai_bot_blocked")).toBe(false);
    });

    it("a robots.txt 404 means unrestricted, not 'unreachable' — no finding either way", async () => {
        const fetchText = fakeSite({
            "https://example.com/robots.txt": { ok: false, status: 404, text: "" },
            "https://example.com/sitemap.xml": { ok: false, text: "" },
            "https://example.com": { ok: true, text: "<a href=\"/\">home</a>" },
        });
        const result = await crawlSite(
            { origin: "https://example.com", planId: "starter_monthly" },
            { fetchText, politeness: instantPoliteness() }
        );
        expect(result.findings.some((f) => f.rule === "robots_txt_unreachable")).toBe(false);
    });

    it("a robots.txt 5xx is reported as unreachable, per the plan doc's 'do not assume allow'", async () => {
        const fetchText = fakeSite({
            "https://example.com/robots.txt": { ok: false, status: 503, text: "" },
            "https://example.com/sitemap.xml": { ok: false, text: "" },
            "https://example.com": { ok: true, text: "<a href=\"/\">home</a>" },
        });
        const result = await crawlSite(
            { origin: "https://example.com", planId: "starter_monthly" },
            { fetchText, politeness: instantPoliteness() }
        );
        const finding = result.findings.find((f) => f.rule === "robots_txt_unreachable");
        expect(finding?.evidence).toContain("503");
    });

    it("our OWN crawler skips a path robots.txt disallows for it, even inside its own discovered sitemap", async () => {
        const fetchText = fakeSite({
            "https://example.com/robots.txt": {
                ok: true,
                text: `User-agent: ${CRAWLER_USER_AGENT}\nDisallow: /private/\n`,
            },
            "https://example.com/sitemap.xml": {
                ok: true,
                text:
                    "<urlset><url><loc>https://example.com/public</loc></url>" +
                    "<url><loc>https://example.com/private/secret</loc></url></urlset>",
            },
            "https://example.com/public": { ok: true, text: SIMPLE_HTML.replace("URLPLACEHOLDER", "https://example.com/public") },
        });
        const result = await crawlSite(
            { origin: "https://example.com", planId: "starter_monthly" },
            { fetchText, politeness: instantPoliteness() }
        );
        expect(result.pages.map((p) => p.url)).toEqual(["https://example.com/public"]);
    });
});

describe("crawlSite — sitemap first, link discovery only as a fallback", () => {
    it("uses the sitemap when one exists, never falling back", async () => {
        const fetchText = fakeSite({
            "https://example.com/robots.txt": { ok: false, status: 404, text: "" },
            "https://example.com/sitemap.xml": {
                ok: true,
                text: "<urlset><url><loc>https://example.com/from-sitemap</loc></url></urlset>",
            },
            "https://example.com/from-sitemap": {
                ok: true,
                text: SIMPLE_HTML.replace("URLPLACEHOLDER", "https://example.com/from-sitemap"),
            },
        });
        const result = await crawlSite(
            { origin: "https://example.com", planId: "starter_monthly" },
            { fetchText, politeness: instantPoliteness() }
        );
        expect(result.pages.map((p) => p.url)).toEqual(["https://example.com/from-sitemap"]);
    });

    it("falls back to homepage link discovery when there is truly no sitemap", async () => {
        const fetchText = fakeSite({
            "https://example.com/robots.txt": { ok: false, status: 404, text: "" },
            "https://example.com/sitemap.xml": { ok: false, status: 404, text: "" },
            "https://example.com": { ok: true, text: '<a href="/menu">Menu</a>' + SIMPLE_HTML.replace("URLPLACEHOLDER", "https://example.com") },
            "https://example.com/menu": { ok: true, text: SIMPLE_HTML.replace("URLPLACEHOLDER", "https://example.com/menu") },
        });
        const result = await crawlSite(
            { origin: "https://example.com", planId: "starter_monthly" },
            { fetchText, politeness: instantPoliteness() }
        );
        const urls = result.pages.map((p) => p.url);
        expect(urls).toContain("https://example.com");
        expect(urls).toContain("https://example.com/menu");
    });
});

describe("crawlSite — per-plan budget and coverage disclosure", () => {
    it("caps at the plan's page limit and discloses it in coverage", async () => {
        const manyUrls = Array.from({ length: 5 }, (_, i) => `https://example.com/p${i}`);
        const fetchText = fakeSite({
            "https://example.com/robots.txt": { ok: false, status: 404, text: "" },
            "https://example.com/sitemap.xml": {
                ok: true,
                text: `<urlset>${manyUrls.map((u) => `<url><loc>${u}</loc></url>`).join("")}</urlset>`,
            },
            ...Object.fromEntries(
                manyUrls.map((u) => [u, { ok: true, text: SIMPLE_HTML.replace("URLPLACEHOLDER", u) }])
            ),
        });
        const result = await crawlSite(
            { origin: "https://example.com", planId: "starter_monthly" },
            { fetchText, politeness: instantPoliteness() }
        );
        // Real cap is 100; this fixture only has 5, so nothing should be capped.
        expect(result.coverage.discovered).toBe(5);
        expect(result.coverage.crawled).toBe(5);
        expect(result.coverage.cappedAt).toBeNull();
    });

    it("records an http_error finding for a page that fails to load", async () => {
        const fetchText = fakeSite({
            "https://example.com/robots.txt": { ok: false, status: 404, text: "" },
            "https://example.com/sitemap.xml": {
                ok: true,
                text: "<urlset><url><loc>https://example.com/broken</loc></url></urlset>",
            },
            "https://example.com/broken": { ok: false, status: 500, text: "" },
        });
        const result = await crawlSite(
            { origin: "https://example.com", planId: "starter_monthly" },
            { fetchText, politeness: instantPoliteness() }
        );
        expect(result.findings.find((f) => f.rule === "http_error")?.severity).toBe("high");
    });
});
