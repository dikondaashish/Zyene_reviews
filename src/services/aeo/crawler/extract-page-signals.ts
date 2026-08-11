/**
 * E-3 / F5.2: the handful of technical signals read straight off one page's
 * HTML, without a DOM parser. Regex over well-formed markup is fragile in
 * general; it is acceptable here because every field extracted comes from a
 * single, narrowly-shaped tag (`<title>`, one `<link rel=canonical>`, one
 * `<meta name=robots>`) rather than anything requiring real tree structure —
 * the moment F5.4's JSON-LD validation is built, THAT will need a real
 * parser, and should get one rather than stretching this file to cover it.
 *
 * Attribute order is NOT assumed. Wolfpack's own live site (checked
 * 2026-08-09) renders `<link href="..." rel="canonical"/>` — href before
 * rel — which an order-assuming regex misses on real, current production
 * markup, not just a hypothetical edge case.
 */
export type PageSignals = {
    title: string | null;
    canonicalUrl: string | null;
    metaRobots: string | null;
    h1Count: number;
    wordCount: number;
};

function decodeEntities(text: string): string {
    return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ");
}

/** Value of one attribute within a single already-isolated tag string, whatever position it is in. */
function attr(tag: string, name: string): string | null {
    const m = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"));
    return m?.[1] !== undefined ? decodeEntities(m[1].trim()) : null;
}

/** Every `<link ...>` tag whose `rel` attribute matches, in document order. */
function findLinkTags(html: string, rel: string): string[] {
    const tags = html.match(/<link\b[^>]*>/gi) ?? [];
    return tags.filter((tag) => attr(tag, "rel")?.toLowerCase() === rel);
}

function findMetaTags(html: string, name: string): string[] {
    const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
    return tags.filter((tag) => attr(tag, "name")?.toLowerCase() === name);
}

/** Rough visible word count: tags, scripts, and styles stripped, whitespace-collapsed. */
function countWords(html: string): number {
    const stripped = html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ");
    const text = decodeEntities(stripped).replace(/\s+/g, " ").trim();
    return text.length === 0 ? 0 : text.split(" ").length;
}

export function extractPageSignals(html: string): PageSignals {
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const canonicalTag = findLinkTags(html, "canonical")[0] ?? null;
    const robotsTag = findMetaTags(html, "robots")[0] ?? null;

    return {
        title: titleMatch?.[1] ? decodeEntities(titleMatch[1].trim()) : null,
        canonicalUrl: canonicalTag ? attr(canonicalTag, "href") : null,
        metaRobots: robotsTag ? attr(robotsTag, "content") : null,
        h1Count: (html.match(/<h1[\s>]/gi) ?? []).length,
        wordCount: countWords(html),
    };
}
