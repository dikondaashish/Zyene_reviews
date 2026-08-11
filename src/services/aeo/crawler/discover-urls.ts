/**
 * E-3 / F5.1: which URLs to crawl, before any budget or robots decision is
 * applied. Sitemap first, per the plan doc; homepage link discovery capped
 * at depth 3 only when no sitemap exists at all.
 *
 * `fetchText` is injected rather than calling the global `fetch` directly, so
 * the traversal/parsing logic here is testable without a real network call —
 * the same split this codebase already uses throughout (pure decision logic,
 * I/O pushed to the edges).
 */
export type FetchText = (url: string) => Promise<{ ok: boolean; status: number; text: string } | null>;

const LOC_PATTERN = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;

/** Every `<loc>` value in one sitemap document, whether it lists pages or child sitemaps. */
function extractLocs(xml: string): string[] {
    return [...xml.matchAll(LOC_PATTERN)].map((m) => m[1]).filter((u): u is string => Boolean(u));
}

/**
 * Sitemap discovery. Returns null when no sitemap exists at all (a 404, or
 * the fetch itself failing) — the caller's signal to fall back to link
 * discovery. An empty-but-present sitemap returns `[]`, which is NOT the same
 * thing and must not trigger the fallback.
 *
 * One level of sitemap-index recursion: a `<sitemapindex>` root's `<loc>`
 * entries point at CHILD sitemaps, not pages, and are fetched once each.
 * Deliberately not recursive beyond that — an index of indexes is real but
 * rare, and unbounded recursion against a site we do not control is exactly
 * the kind of thing the per-plan page cap exists to make unnecessary anyway.
 */
export async function discoverUrlsViaSitemap(origin: string, fetchText: FetchText): Promise<string[] | null> {
    const root = await fetchText(new URL("/sitemap.xml", origin).toString());
    if (!root || !root.ok) return null;

    const isIndex = /<sitemapindex[\s>]/i.test(root.text);
    if (!isIndex) return extractLocs(root.text);

    const childSitemapUrls = extractLocs(root.text);
    const pages: string[] = [];
    for (const childUrl of childSitemapUrls) {
        const child = await fetchText(childUrl);
        if (child?.ok) pages.push(...extractLocs(child.text));
    }
    return pages;
}

function isSameOrigin(url: string, origin: string): boolean {
    try {
        return new URL(url).origin === new URL(origin).origin;
    } catch {
        return false;
    }
}

/** Every same-origin `href` in one page's HTML, resolved against the page's own URL. */
function extractSameOriginLinks(html: string, pageUrl: string, origin: string): string[] {
    const hrefs = [...html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
    const resolved: string[] = [];
    for (const href of hrefs) {
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
        try {
            const abs = new URL(href, pageUrl).toString();
            if (isSameOrigin(abs, origin)) resolved.push(abs);
        } catch {
            continue;
        }
    }
    return resolved;
}

/**
 * BFS from the homepage, same-origin only, capped at depth 3 — the exact
 * fallback the plan doc specifies for a site with no sitemap. `maxPages`
 * bounds the frontier so a large, sitemap-less site cannot make this
 * discovery phase itself run away before the per-plan cap ever gets applied.
 */
export async function discoverUrlsViaLinks(
    origin: string,
    fetchHtml: FetchText,
    options?: { maxDepth?: number; maxPages?: number }
): Promise<string[]> {
    const maxDepth = options?.maxDepth ?? 3;
    const maxPages = options?.maxPages ?? 500;

    const visited = new Set<string>([origin]);
    let frontier = [origin];

    for (let depth = 0; depth < maxDepth && frontier.length > 0 && visited.size < maxPages; depth += 1) {
        const next: string[] = [];
        for (const pageUrl of frontier) {
            if (visited.size >= maxPages) break;
            const page = await fetchHtml(pageUrl);
            if (!page?.ok) continue;
            for (const link of extractSameOriginLinks(page.text, pageUrl, origin)) {
                if (!visited.has(link) && visited.size < maxPages) {
                    visited.add(link);
                    next.push(link);
                }
            }
        }
        frontier = next;
    }

    return [...visited];
}
