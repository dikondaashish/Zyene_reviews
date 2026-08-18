/**
 * F8.2 — citation gained/lost alerts, per URL.
 *
 * Compares which of OUR pages were cited in a recent window against a baseline
 * window. Only `classification: "own"` citations are considered: a competitor
 * losing a citation is interesting, but it is not something the owner can act
 * on, and PRD-9's whole thesis is that an alert nobody can act on trains people
 * to ignore the next one.
 *
 * Noise control here is structural rather than statistical. A citation is a
 * present/absent fact per sample, not a proportion with a variance to test, so
 * the significance gate F8.1 uses does not apply. Instead a URL must have been
 * cited in at least MIN_BASELINE_CITATIONS baseline samples before its
 * disappearance counts as a loss — a page cited once and never again was never
 * really "ours" on that prompt.
 */

export type CitationFact = {
    /** Canonicalised URL, so a tracking param cannot read as a different page. */
    normalizedUrl: string;
    /** ISO timestamp of the sample this citation came from. */
    sampledAt: string;
};

export type CitationWindows = {
    baseline: readonly CitationFact[];
    recent: readonly CitationFact[];
};

export type CitationAlert = {
    direction: "lost" | "gained";
    normalizedUrl: string;
    baselineCitations: number;
    recentCitations: number;
};

/**
 * A URL cited only once in the whole baseline is not an established citation,
 * and its absence is not a regression worth an email.
 */
export const MIN_BASELINE_CITATIONS = 2;

/**
 * A gained citation needs corroboration too — one appearance can be a single
 * lucky sample rather than a page that has started ranking.
 */
export const MIN_RECENT_CITATIONS = 2;

function countByUrl(facts: readonly CitationFact[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const fact of facts) {
        counts.set(fact.normalizedUrl, (counts.get(fact.normalizedUrl) ?? 0) + 1);
    }
    return counts;
}

/**
 * Splits citations into a baseline and a recent window at `cutoff`.
 *
 * Exported so the caller does the windowing once and the detector stays pure.
 */
export function splitCitationWindows(
    facts: readonly CitationFact[],
    cutoff: Date
): CitationWindows {
    const cutoffMs = cutoff.getTime();
    const baseline: CitationFact[] = [];
    const recent: CitationFact[] = [];

    for (const fact of facts) {
        const ms = Date.parse(fact.sampledAt);
        if (Number.isNaN(ms)) continue;
        if (ms >= cutoffMs) recent.push(fact);
        else baseline.push(fact);
    }

    return { baseline, recent };
}

export function detectCitationAlerts(windows: CitationWindows): CitationAlert[] {
    // With no baseline at all there is nothing to have lost, and every URL
    // would read as "gained" — the first-run alert storm criterion #42 guards
    // against for prompts, applied here to pages.
    if (windows.baseline.length === 0) return [];

    const baselineCounts = countByUrl(windows.baseline);
    const recentCounts = countByUrl(windows.recent);
    const alerts: CitationAlert[] = [];

    for (const [url, baselineCount] of baselineCounts) {
        const recentCount = recentCounts.get(url) ?? 0;
        if (baselineCount >= MIN_BASELINE_CITATIONS && recentCount === 0) {
            alerts.push({
                direction: "lost",
                normalizedUrl: url,
                baselineCitations: baselineCount,
                recentCitations: 0,
            });
        }
    }

    for (const [url, recentCount] of recentCounts) {
        const baselineCount = baselineCounts.get(url) ?? 0;
        if (baselineCount === 0 && recentCount >= MIN_RECENT_CITATIONS) {
            alerts.push({
                direction: "gained",
                normalizedUrl: url,
                baselineCitations: 0,
                recentCitations: recentCount,
            });
        }
    }

    // Stable order: losses first (actionable), then by URL, so a digest reads
    // the same way every time and tests do not depend on Map iteration order.
    return alerts.sort((a, b) =>
        a.direction === b.direction
            ? a.normalizedUrl.localeCompare(b.normalizedUrl)
            : a.direction === "lost"
              ? -1
              : 1
    );
}
