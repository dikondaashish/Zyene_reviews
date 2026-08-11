/**
 * E-3: per-plan page cap. Starter and Professional are named explicitly in
 * PRD-6's inputs; a plan this map does not know gets the Starter cap, not an
 * unbounded crawl — the safer failure for a real HTTP footprint against a
 * site we do not control.
 */
export const CRAWL_PAGE_CAP: Readonly<Record<string, number>> = {
    starter_monthly: 100,
    starter_yearly: 100,
    professional_monthly: 1000,
    professional_yearly: 1000,
};

export const DEFAULT_CRAWL_PAGE_CAP = CRAWL_PAGE_CAP.starter_monthly;

export function pageCapForPlan(planId: string | null | undefined): number {
    if (!planId) return DEFAULT_CRAWL_PAGE_CAP;
    return CRAWL_PAGE_CAP[planId] ?? DEFAULT_CRAWL_PAGE_CAP;
}

export type CrawlCoverage = {
    discovered: number;
    crawled: number;
    cappedAt: number | null;
};

/**
 * Which of the discovered URLs actually get crawled, and the coverage note
 * to disclose. "Disclose coverage %" is a PRD-6 edge case in its own right —
 * a customer whose site was only 30% covered needs to know that, not read a
 * partial audit as a complete one.
 */
export function applyPageCap(discovered: readonly string[], cap: number): { urls: string[]; coverage: CrawlCoverage } {
    const capped = discovered.length > cap;
    return {
        urls: discovered.slice(0, cap),
        coverage: {
            discovered: discovered.length,
            crawled: Math.min(discovered.length, cap),
            cappedAt: capped ? cap : null,
        },
    };
}
