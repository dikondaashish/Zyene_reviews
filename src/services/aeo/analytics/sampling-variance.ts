export type RepeatVariance = {
    attempts: number;
    namedCount: number;
    rate: number | null;
    variance: number | null;
    standardError: number | null;
    confidence95: { low: number; high: number };
};

/** Bernoulli sample variance for repeated observations of one prompt and engine. */
export function computeRepeatVariance(observations: readonly boolean[]): RepeatVariance {
    const attempts = observations.length;
    const namedCount = observations.filter(Boolean).length;
    if (attempts === 0) {
        return { attempts, namedCount, rate: null, variance: null, standardError: null, confidence95: { low: 0, high: 1 } };
    }

    const rate = namedCount / attempts;
    if (attempts === 1) {
        return { attempts, namedCount, rate, variance: null, standardError: null, confidence95: { low: 0, high: 1 } };
    }

    const variance = (attempts * rate * (1 - rate)) / (attempts - 1);
    const standardError = Math.sqrt(variance / attempts);
    return {
        attempts,
        namedCount,
        rate,
        variance,
        standardError,
        confidence95: {
            low: Math.max(0, rate - 1.96 * standardError),
            high: Math.min(1, rate + 1.96 * standardError),
        },
    };
}
