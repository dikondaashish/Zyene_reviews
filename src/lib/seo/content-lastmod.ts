/**
 * Resolves the sitemap <lastmod> date for marketing pages that carry no date in
 * their own content data. The JSON is generated from git history by
 * `pnpm seo:lastmod` (scripts/generate-content-lastmod.mjs) and committed, so
 * builds never need git.
 */
import lastmodJson from "./content-lastmod.json";

const LASTMOD: Record<string, string> = lastmodJson;

/** Prefix keys end with "/"; longest prefix wins. */
const PREFIX_KEYS = Object.keys(LASTMOD)
    .filter((key) => key.endsWith("/") && key !== "/")
    .sort((a, b) => b.length - a.length);

/** ISO date (YYYY-MM-DD) of the last content change for a marketing path, if known. */
export function getContentLastmod(path: string): string | undefined {
    const normalized = path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;
    const exact = LASTMOD[normalized];
    if (exact) return exact;
    const prefix = PREFIX_KEYS.find((key) => normalized.startsWith(key));
    return prefix ? LASTMOD[prefix] : undefined;
}
