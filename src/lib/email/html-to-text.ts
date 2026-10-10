/** Plain-text alternative for clients that disable HTML; retain destination URLs. */
export function emailHtmlToText(html: string): string {
    const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", mdash: "—", ndash: "–", hellip: "…" };
    const decode = (value: string) => value.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (match, entity: string) => {
        if (!entity.startsWith("#")) return entities[entity.toLowerCase()] ?? match;
        const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
        return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    });
    return decode(html
        .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, "")
        .replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<div\b[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/div>/gi, "")
        .replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href: string, label: string) => {
            const text = label.replace(/<[^>]+>/g, "").trim();
            return decode(text) === decode(href) ? text : `${text} (${href})`;
        })
        .replace(/<li\b[^>]*>/gi, "\n- ")
        .replace(/<br\s*\/?>|<\/(p|div|h[1-6]|tr|li|table)>/gi, "\n\n")
        .replace(/<\/(td|th)>/gi, " | ")
        .replace(/<[^>]+>/g, ""))
        .replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").replace(/ *\| *(?=\n|$)/g, "").trim();
}
