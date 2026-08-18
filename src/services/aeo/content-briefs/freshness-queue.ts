export type FreshnessFact = { url: string; lostCitations: number; rankDrop: number; daysSinceUpdate: number };

export function rankFreshnessQueue(facts: readonly FreshnessFact[]): (FreshnessFact & { score: number })[] {
    return facts.map((fact) => ({
        ...fact,
        score: fact.lostCitations * 20 + Math.max(0, fact.rankDrop) * 5 + Math.min(20, Math.max(0, fact.daysSinceUpdate) / 30),
    })).sort((a, b) => b.score - a.score || a.url.localeCompare(b.url));
}
