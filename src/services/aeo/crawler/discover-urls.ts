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
 * Strip a single leading `www.` so an apex origin and its `www` host count as
 * the same site. Real sitemaps routinely list one while `businesses.website`
 * holds the other, and treating that as cross-origin would silently drop a
 * site's entire URL set.
 */
function baseHost(host: string): string {
    return host.toLowerCase().replace(/^www\./, "");
}

/**
 * A sitemap `<loc>` is attacker-controlled input: it is whatever the crawled
 * site chose to publish. Without this, a tenant could point
 * `businesses.website` at a host they control and list
 * `http://169.254.169.254/...` in its sitemap, and the crawler would fetch
 * that internal address and store the response as page evidence they can read
 * back. Link discovery already refuses cross-origin hrefs (`isSameOrigin`
 * below); sitemap discovery must hold the same line.
 *
 * Scheme is pinned to http/https as well, so a `<loc>` cannot smuggle
 * `file://` or similar past a host check that only compares hostnames.
 */
function isSameSite(url: string, origin: string): boolean {
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
        return baseHost(parsed.host) === baseHost(new URL(origin).host);
    } catch {
        return false;
    }
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

    // Filtering happens after the null/empty distinction is settled: a sitemap
    // that exists but lists only foreign URLs is still a sitemap, so it returns
    // `[]` and must NOT fall back to link discovery.
    const isIndex = /<sitemapindex[\s>]/i.test(root.text);
    if (!isIndex) return extractLocs(root.text).filter((u) => isSameSite(u, origin));

    // Child sitemaps are fetched, so they are filtered BEFORE the request goes
    // out — not just on the way back.
    const childSitemapUrls = extractLocs(root.text).filter((u) => isSameSite(u, origin));
    const pages: string[] = [];
    for (const childUrl of childSitemapUrls) {
        const child = await fetchText(childUrl);
        if (child?.ok) pages.push(...extractLocs(child.text).filter((u) => isSameSite(u, origin)));
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
