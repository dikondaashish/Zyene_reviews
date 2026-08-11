import type { CrawlFindingRule, CrawlFindingSeverity } from "../crawler/crawl-findings";

export type FindingLike = {
    rule: CrawlFindingRule;
    severity: CrawlFindingSeverity;
    pageUrl: string | null;
    evidence: string;
};

/** Same finding, same page, across two runs — the identity a "newly appeared" diff keys on. */
export function findingKey(f: Pick<FindingLike, "rule" | "pageUrl">): string {
    return `${f.rule}:${f.pageUrl ?? "__site__"}`;
}

/**
 * F8.4: technical blocker alerts — critical/high findings that are NEW since
 * the previous run, not every finding that still exists. An unresolved
 * finding from three weeks ago re-alerting every single week is exactly the
 * "alerts train users to ignore us" failure PRD-9 opens with; a finding that
 * newly appeared is the one worth interrupting someone for.
 */
export function detectNewTechnicalAlerts(
    currentFindings: readonly FindingLike[],
    previousFindingKeys: ReadonlySet<string>
): FindingLike[] {
    return currentFindings.filter(
        (f) =>
            (f.severity === "critical" || f.severity === "high") &&
            !previousFindingKeys.has(findingKey(f))
    );
}
