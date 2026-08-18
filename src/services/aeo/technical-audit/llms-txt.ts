export function parseLlmsTxt(content: string) {
    const normalized = content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
    const titleMatch = normalized.match(/^#\s+(.+)$/m);
    const h1Count = (normalized.match(/^#\s+/gm) ?? []).length;
    const links = [...normalized.matchAll(/^-\s+\[[^\]]+\]\((https?:\/\/[^)]+)\)(?::\s*.*)?$/gm)].map((match) => match[1] as string);
    const issues: string[] = [];
    if (!titleMatch) issues.push("missing_h1");
    if (h1Count > 1) issues.push("multiple_h1");
    return {
        valid: issues.length === 0,
        title: titleMatch?.[1]?.trim() ?? null,
        summaryPresent: /^>\s+\S+/m.test(normalized),
        linkCount: links.length,
        links,
        issues,
    };
}
