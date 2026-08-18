type DailyFact = { date: string; citationEvents: number; clicks: number };

function pearson(left: readonly number[], right: readonly number[]): number | null {
    if (left.length < 2 || left.length !== right.length) return null;
    const leftMean = left.reduce((sum, value) => sum + value, 0) / left.length;
    const rightMean = right.reduce((sum, value) => sum + value, 0) / right.length;
    let numerator = 0;
    let leftSquare = 0;
    let rightSquare = 0;
    for (let index = 0; index < left.length; index += 1) {
        const a = (left[index] ?? 0) - leftMean;
        const b = (right[index] ?? 0) - rightMean;
        numerator += a * b;
        leftSquare += a * a;
        rightSquare += b * b;
    }
    const denominator = Math.sqrt(leftSquare * rightSquare);
    return denominator === 0 ? null : numerator / denominator;
}

export function correlateCitationTraffic(facts: readonly DailyFact[]) {
    const sorted = [...facts].sort((a, b) => a.date.localeCompare(b.date));
    return {
        overlappingDays: sorted.length,
        correlation: sorted.length < 7
            ? null
            : pearson(sorted.map((row) => row.citationEvents), sorted.map((row) => row.clicks)),
        interpretation: "Correlation is directional evidence and does not establish causation.",
    };
}
