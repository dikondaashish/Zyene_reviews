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
    // Wilson score interval remains informative at zero/all successes and small n.
    const z2 = 1.96 ** 2;
    const denominator = 1 + z2 / attempts;
    const center = (rate + z2 / (2 * attempts)) / denominator;
    const margin = 1.96 * Math.sqrt(rate * (1 - rate) / attempts + z2 / (4 * attempts ** 2)) / denominator;
    return {
        attempts,
        namedCount,
        rate,
        variance,
        standardError,
        confidence95: {
            low: namedCount === 0 ? 0 : Math.max(0, center - margin),
            high: namedCount === attempts ? 1 : Math.min(1, center + margin),
        },
    };
}
