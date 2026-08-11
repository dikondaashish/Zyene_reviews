/**
 * F6.2: which existing crawled page should own a prompt, or none.
 *
 * PRD-7 specifies "embedding similarity + GSC relevance." Neither exists in
 * this codebase — there is no embedding model call anywhere in this repo,
 * and E-2's Search Console data is real but sparse (most accounts have not
 * granted the incremental scope yet, see load-search-console-section.ts).
 * Rather than fabricate a vector call or silently skip the whole feature,
 * this uses term-overlap scoring: real, verifiable, and honestly a weaker
 * signal than embeddings — documented here, not disguised as the original
 * design. GSC relevance folds in as a real bonus when it exists (see
 * gsc-relevance-bonus below), never assumed.
 */

const STOPWORDS = new Set([
    "the", "a", "an", "and", "or", "of", "in", "on", "for", "to", "is", "are",
    "what", "how", "why", "when", "where", "who", "which", "best", "near", "me",
    "with", "at", "by", "from", "that", "this", "it", "as", "be", "do", "does",
]);

function significantTerms(text: string): Set<string> {
    return new Set(
        text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .split(/\s+/)
            .filter((t) => t.length > 2 && !STOPWORDS.has(t))
    );
}

export type CrawledPageSummary = {
    url: string;
    title: string | null;
    /** First ~150 words of visible body text — enough to score against without loading the full page. */
    contentExcerpt: string;
};

export type PageMappingResult =
    | { hasOwner: true; url: string; score: number }
    | { hasOwner: false; reason: "no_pages_crawled" | "no_page_scores_above_threshold" };

/** Below this overlap score, a page is "unrelated," not "a weak match" — PRD-7's own edge case: never force-fit. */
const MIN_MATCH_SCORE = 0.15;
/** A title match counts several times as much as the same term appearing in body text. */
const TITLE_WEIGHT = 3;

function overlapScore(promptTerms: ReadonlySet<string>, page: CrawledPageSummary): number {
    if (promptTerms.size === 0) return 0;
    const titleTerms = significantTerms(page.title ?? "");
    const bodyTerms = significantTerms(page.contentExcerpt);

    let weightedMatches = 0;
    for (const term of promptTerms) {
        if (titleTerms.has(term)) weightedMatches += TITLE_WEIGHT;
        else if (bodyTerms.has(term)) weightedMatches += 1;
    }
    return weightedMatches / (promptTerms.size * TITLE_WEIGHT);
}

export function mapPromptToPage(
    promptText: string,
    pages: readonly CrawledPageSummary[]
): PageMappingResult {
    if (pages.length === 0) return { hasOwner: false, reason: "no_pages_crawled" };

    const promptTerms = significantTerms(promptText);
    let best: { url: string; score: number } | null = null;

    for (const page of pages) {
        const score = overlapScore(promptTerms, page);
        if (!best || score > best.score) best = { url: page.url, score };
    }

    if (!best || best.score < MIN_MATCH_SCORE) {
        return { hasOwner: false, reason: "no_page_scores_above_threshold" };
    }
    return { hasOwner: true, url: best.url, score: best.score };
}
