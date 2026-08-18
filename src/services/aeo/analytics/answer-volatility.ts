type Observation = { answerText: string; citations: readonly string[] };

function tokens(value: string): Set<string> {
    return new Set(value.toLowerCase().match(/[a-z0-9]+/g) ?? []);
}

function distance(left: Set<string>, right: Set<string>): number {
    const union = new Set([...left, ...right]);
    if (union.size === 0) return 0;
    let overlap = 0;
    for (const value of left) if (right.has(value)) overlap += 1;
    return 1 - overlap / union.size;
}

function meanPairwise(values: readonly Set<string>[]): number {
    if (values.length < 2) return 0;
    let total = 0;
    let pairs = 0;
    for (let left = 0; left < values.length; left += 1) {
        for (let right = left + 1; right < values.length; right += 1) {
            total += distance(values[left] ?? new Set(), values[right] ?? new Set());
            pairs += 1;
        }
    }
    return pairs ? total / pairs : 0;
}

export function computeAnswerVolatility(observations: readonly Observation[]) {
    const answerVolatility = meanPairwise(observations.map((row) => tokens(row.answerText)));
    const citationVolatility = meanPairwise(observations.map((row) => new Set(row.citations)));
    return {
        observations: observations.length,
        answerVolatility,
        citationVolatility,
        score: answerVolatility * 0.7 + citationVolatility * 0.3,
    };
}
