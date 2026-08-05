import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import sitemap from "../../src/app/sitemap";

/**
 * Guards organic traffic on an SEO-led product.
 *
 * src/app/sitemap.ts is a hand-maintained route manifest. Adding a marketing
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

describe("sitemap coverage", () => {
    const routes = collectStaticRoutes(MARKETING_ROOT);
    const entries = sitemap();
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
            `These marketing pages are indexable but absent from src/app/sitemap.ts, so they will not be submitted for indexing. Add them there, or set robots: { index: false } if they are intentionally private:\n  ${missing.join("\n  ")}`,
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
});
