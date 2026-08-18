export type CompetitiveMentionFact = {
    promptId: string;
    sampleId: string;
    sampledAt: string;
    brandKind: "own" | "competitor" | "unknown";
    brandLabel: string;
    sentiment: "positive" | "neutral" | "negative" | null;
};

export function detectCompetitorOvertakes(facts: readonly CompetitiveMentionFact[]) {
    const times = [...new Set(facts.map((fact) => fact.sampledAt))].sort();
    if (times.length < 4) return [];
    const split = times[Math.floor(times.length / 2)];
    const byCompetitor = new Map<string, Set<string>>();
    const keys = [...new Set(facts.map((fact) => fact.promptId))];
    for (const promptId of keys) {
        const promptFacts = facts.filter((fact) => fact.promptId === promptId);
        const baseline = promptFacts.filter((fact) => fact.sampledAt < split);
        const recent = promptFacts.filter((fact) => fact.sampledAt >= split);
        const competitors = [...new Set(promptFacts.filter((fact) => fact.brandKind === "competitor").map((fact) => fact.brandLabel))];
        for (const competitor of competitors) {
            const ownBaseline = new Set(baseline.filter((fact) => fact.brandKind === "own").map((fact) => fact.sampleId)).size;
            const theirBaseline = new Set(baseline.filter((fact) => fact.brandLabel === competitor).map((fact) => fact.sampleId)).size;
            const ownRecent = new Set(recent.filter((fact) => fact.brandKind === "own").map((fact) => fact.sampleId)).size;
            const theirRecent = new Set(recent.filter((fact) => fact.brandLabel === competitor).map((fact) => fact.sampleId)).size;
            if (ownBaseline >= theirBaseline && theirRecent > ownRecent) {
                const prompts = byCompetitor.get(competitor) ?? new Set<string>();
                prompts.add(promptId); byCompetitor.set(competitor, prompts);
            }
        }
    }
    return [...byCompetitor].map(([competitor, prompts]) => ({ competitor, promptIds: [...prompts] }))
        .filter((row) => row.promptIds.length > 0).sort((a, b) => b.promptIds.length - a.promptIds.length);
}

export function detectNegativeSentimentSpike(facts: readonly CompetitiveMentionFact[]) {
    const own = facts.filter((fact) => fact.brandKind === "own" && fact.sentiment);
    const samples = [...new Set(own.map((fact) => fact.sampleId))];
    if (samples.length < 6) return null;
    const ordered = [...own].sort((a, b) => a.sampledAt.localeCompare(b.sampledAt));
    const split = ordered[Math.floor(ordered.length / 2)]?.sampledAt;
    if (!split) return null;
    const baseline = ordered.filter((fact) => fact.sampledAt < split);
    const recent = ordered.filter((fact) => fact.sampledAt >= split);
    if (baseline.length < 3 || recent.length < 3) return null;
    const baselineRate = baseline.filter((fact) => fact.sentiment === "negative").length / baseline.length;
    const recentRate = recent.filter((fact) => fact.sentiment === "negative").length / recent.length;
    const delta = recentRate - baselineRate;
    return delta >= 0.2 ? { baselineRate, recentRate, delta, baselineCount: baseline.length, recentCount: recent.length } : null;
}
