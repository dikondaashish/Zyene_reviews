#!/usr/bin/env node
/**
 * Regenerates src/lib/seo/content-lastmod.json: the <lastmod> date for every
 * sitemap URL that has no date of its own (blog posts and resource guides carry
 * theirs in content data).
 *
 * Dates come from the last git commit that touched the page's source files, so
 * they only move when the page actually changes. Google uses <lastmod> to
 * prioritise recrawls and ignores it when it is missing or always "now".
 *
 * Usage: pnpm seo:lastmod   (run after editing marketing pages, then commit the JSON)
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "src/lib/seo/content-lastmod.json");
const MARKETING = "src/app/(marketing)";

function lastCommitDate(paths) {
    const existing = paths.filter((p) => existsSync(join(ROOT, p)));
    if (existing.length === 0) return null;
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", ...existing], {
        cwd: ROOT,
        encoding: "utf8",
    }).trim();
    return out || null;
}

/** Static marketing routes: `(group)` segments are ignored, `[param]` dirs skipped. */
function staticMarketingRoutes(dir = MARKETING, urlParts = [], acc = []) {
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (entry.name.includes("[")) continue;
            const grouped = entry.name.startsWith("(") || entry.name.startsWith("@") || entry.name.startsWith("_");
            staticMarketingRoutes(join(dir, entry.name), grouped ? urlParts : [...urlParts, entry.name], acc);
        } else if (entry.name === "page.tsx") {
            acc.push({ url: `/${urlParts.join("/")}` || "/", dir });
        }
    }
    return acc;
}

const entries = {};

// Core static pages: the route directory (sub-routes and colocated data included).
for (const route of staticMarketingRoutes()) {
    if (route.url.startsWith("/es/")) continue;
    const sources = route.url === "/" ? [`${MARKETING}/page.tsx`, `${MARKETING}/page-view.tsx`] : [route.dir];
    entries[route.url] = lastCommitDate(sources);
}

// Dynamic sections: one date per data source, keyed by URL prefix.
const PREFIXES = {
    "/compare/": ["src/lib/comparisons", `${MARKETING}/compare/[competitor]`],
    "/industries/": ["src/lib/industries/industry-data.ts", `${MARKETING}/industries/[industry]`],
    "/tools/": ["src/lib/free-tools", `${MARKETING}/tools`],
    "/help/": ["src/lib/content/help-types.ts", "src/lib/content/help-data.ts", `${MARKETING}/help`],
};
for (const [prefix, sources] of Object.entries(PREFIXES)) entries[prefix] = lastCommitDate(sources);

// Feature pillars: each page has its own content file.
const featureContent = "src/components/marketing/feature-landing/content";
for (const file of readdirSync(join(ROOT, featureContent))) {
    if (!file.endsWith(".tsx")) continue;
    const slug = file.replace(/\.tsx$/, "");
    entries[`/features/${slug}`] = lastCommitDate([
        `${featureContent}/${file}`,
        "src/lib/growth/feature-pillars-catalog-collect.ts",
        "src/lib/growth/feature-pillars-catalog-insight.ts",
    ]);
}

// Help: one article file per category covers the hub and every article in it.
for (const dirent of readdirSync(join(ROOT, "src/lib/content"))) {
    const match = /^help-articles-(.+)\.ts$/.exec(dirent);
    if (!match) continue;
    const date = lastCommitDate([`src/lib/content/${dirent}`]);
    entries[`/help/${match[1]}`] = date;
    entries[`/help/${match[1]}/`] = date;
}

// Docs: one route directory per page.
for (const dirent of readdirSync(join(ROOT, "src/app/docs"), { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue;
    entries[`/docs/${dirent.name}`] = lastCommitDate([`src/app/docs/${dirent.name}`]);
}
entries["/docs"] = lastCommitDate(["src/app/docs/page.tsx", "src/app/docs/layout.tsx"]);

const sorted = Object.fromEntries(
    Object.entries(entries)
        .filter(([, date]) => date)
        .sort(([a], [b]) => a.localeCompare(b)),
);
writeFileSync(OUT, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`Wrote ${Object.keys(sorted).length} lastmod entries to ${OUT}`);
