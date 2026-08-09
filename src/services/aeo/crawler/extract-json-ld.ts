/**
 * F5.4: pulls every JSON-LD block out of a page's raw HTML and parses it with
 * real JSON.parse — regex only isolates the `<script>` tag itself (the same
 * narrow, well-defined pattern extract-page-signals.ts already uses for
 * `<title>`/`<link>`/`<meta>`), never the JSON payload inside it. A malformed
 * block is captured as a `parseError`, never thrown — one broken script tag
 * on a page must not stop the crawl or lose the other findings for that page.
 */
export type JsonLdBlock = {
    raw: string;
    parsed: unknown | null;
    parseError: string | null;
};

export function extractJsonLdBlocks(html: string): JsonLdBlock[] {
    const blocks: JsonLdBlock[] = [];
    const re = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;

    while ((match = re.exec(html)) !== null) {
        const raw = match[1].trim();
        if (!raw) continue;
        try {
            blocks.push({ raw, parsed: JSON.parse(raw), parseError: null });
        } catch (error) {
            blocks.push({
                raw,
                parsed: null,
                parseError: error instanceof Error ? error.message : "Invalid JSON",
            });
        }
    }
    return blocks;
}

/**
 * Flattens `@graph` wrappers and top-level arrays into a flat list of
 * entities. A block can legally be one object, an array of objects, or an
 * object with a `@graph` array — schema.org and Google both allow all three,
 * and treating only the first shape as valid is how a validator convinces
 * itself real markup is broken.
 */
export function flattenEntities(parsed: unknown): Record<string, unknown>[] {
    if (parsed === null || parsed === undefined) return [];
    if (Array.isArray(parsed)) return parsed.flatMap(flattenEntities);
    if (typeof parsed !== "object") return [];

    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj["@graph"])) {
        return (obj["@graph"] as unknown[]).flatMap(flattenEntities);
    }
    return [obj];
}

/** `@type` can be a single string or an array of strings (multi-typed entity). */
export function entityTypes(entity: Record<string, unknown>): string[] {
    const t = entity["@type"];
    if (typeof t === "string") return [t];
    if (Array.isArray(t)) return t.filter((v): v is string => typeof v === "string");
    return [];
}
