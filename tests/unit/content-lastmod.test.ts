import { describe, expect, it } from "vitest";
import { getContentLastmod } from "../../src/lib/seo/content-lastmod";
import { getAllSitemapEntries } from "../../src/lib/seo/sitemap";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("content lastmod", () => {
    it("resolves exact paths and trailing-slash variants", () => {
        expect(getContentLastmod("/pricing")).toMatch(ISO_DATE);
        expect(getContentLastmod("/pricing/")).toBe(getContentLastmod("/pricing"));
        expect(getContentLastmod("/")).toMatch(ISO_DATE);
    });

    it("falls back to the longest matching prefix for dynamic sections", () => {
        expect(getContentLastmod("/help/billing/plans-and-pricing")).toBe(getContentLastmod("/help/billing"));
        expect(getContentLastmod("/industries/plumbing")).toMatch(ISO_DATE);
        expect(getContentLastmod("/compare/birdeye")).toMatch(ISO_DATE);
    });

    it("returns undefined for unknown paths", () => {
        expect(getContentLastmod("/no-such-page")).toBeUndefined();
    });

    it("gives every sitemap URL a lastmod so Google can prioritise recrawls", () => {
        const missing = getAllSitemapEntries()
            .filter((entry) => !entry.lastModified)
            .map((entry) => new URL(entry.url).pathname);

        expect(
            missing,
            `These sitemap URLs have no <lastmod>. Run \`pnpm seo:lastmod\` and commit src/lib/seo/content-lastmod.json:\n  ${missing.join("\n  ")}`,
        ).toEqual([]);
    });

    it("never emits a lastmod in the future", () => {
        const today = new Date().toISOString().slice(0, 10);
        for (const entry of getAllSitemapEntries()) {
            const value = entry.lastModified;
            const date = value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
            expect(date <= today, `${entry.url} has future lastmod ${date}`).toBe(true);
        }
    });
});
