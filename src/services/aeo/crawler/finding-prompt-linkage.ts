/**
 * F5.12: which prompts a crawl finding actually affects — never claimed
 * beyond what the data supports.
 *
 *   confirmed          Page-level finding on a URL an AI engine actually
 *                       cited for a specific active prompt. Direct evidence.
 *   likely              Site-wide finding (robots/AI-bot blocking) on a
 *                       business AI engines have demonstrably cited before —
 *                       a block plausibly affects future citations too.
 *   possible            Site-wide finding with no citation history yet, or a
 *                       page-level finding on a page that was never cited.
 *                       Plausible, not evidenced.
 *   no_demonstrated_impact   No active prompts at all — nothing to affect.
 */
export type ImpactLevel = "confirmed" | "likely" | "possible" | "no_demonstrated_impact";

export type CitedPromptFact = {
    normalizedUrl: string;
    promptId: string;
    promptText: string;
};

export type FindingImpact = {
    level: ImpactLevel;
    affectedPrompts: { promptId: string; promptText: string }[];
};

/** Same shape aeo_citations.normalized_url uses: lowercase host, no hash, no trailing slash (except root). */
export function normalizeUrlForMatch(rawUrl: string): string {
    try {
        const url = new URL(rawUrl);
        url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
        url.hash = "";
        if (url.pathname !== "/" && url.pathname.endsWith("/")) {
            url.pathname = url.pathname.slice(0, -1);
        }
        return url.toString().replace(/\?$/, "");
    } catch {
        return rawUrl;
    }
}

export function classifyFindingImpact(
    finding: { pageUrl: string | null },
    context: { citations: readonly CitedPromptFact[]; activePromptCount: number }
): FindingImpact {
    if (context.activePromptCount === 0) {
        return { level: "no_demonstrated_impact", affectedPrompts: [] };
    }

    if (finding.pageUrl) {
        const normalized = normalizeUrlForMatch(finding.pageUrl);
        const matches = context.citations.filter((c) => c.normalizedUrl === normalized);
        if (matches.length > 0) {
            const seen = new Set<string>();
            const affectedPrompts = matches
                .filter((m) => (seen.has(m.promptId) ? false : (seen.add(m.promptId), true)))
                .map((m) => ({ promptId: m.promptId, promptText: m.promptText }));
            return { level: "confirmed", affectedPrompts };
        }
        return { level: "possible", affectedPrompts: [] };
    }

    // Run-level (site-wide) finding: pageUrl is null.
    if (context.citations.length > 0) {
        return { level: "likely", affectedPrompts: [] };
    }
    return { level: "possible", affectedPrompts: [] };
}
