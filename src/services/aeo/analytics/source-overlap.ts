export type SourceBrandFact = { domain: string; brandKind: "own" | "competitor" };

export function computeSourceOverlap(facts: readonly SourceBrandFact[]): {
    domain: string;
    competitorCitations: number;
    ownCitations: number;
}[] {
    const domains = new Map<string, { competitorCitations: number; ownCitations: number }>();
    for (const fact of facts) {
        const row = domains.get(fact.domain) ?? { competitorCitations: 0, ownCitations: 0 };
        if (fact.brandKind === "own") row.ownCitations += 1;
        else row.competitorCitations += 1;
        domains.set(fact.domain, row);
    }
    return [...domains.entries()]
        .filter(([, counts]) => counts.competitorCitations > 0 && counts.ownCitations === 0)
        .map(([domain, counts]) => ({ domain, ...counts }))
        .sort((a, b) => b.competitorCitations - a.competitorCitations || a.domain.localeCompare(b.domain));
}
