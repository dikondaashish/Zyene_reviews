import type { AnswerEngineId } from "../engines/engine-types";

/**
 * QA #37. Below this many observations a rate is not reported at all.
 *
 * Three is not arbitrary caution. Gemini answered the same prompt with the same
 * pinned model on two runs and named the business in one and not the other — so
 * a single observation is a coin flip rendered as a percentage, and "0%
 * visibility on ChatGPT" from one sample is a claim the data cannot support.
 */
export const MIN_OBSERVATIONS = 3;

/** One persisted sample, reduced to what a visibility rate depends on. */
export type SampleFact = {
    engineId: AnswerEngineId;
    status: "ok" | "no_answer" | "failed";
    modelId: string | null;
    /** True when the own brand was NAMED in prose. Cited-only does not count. */
    ownBrandNamed: boolean;
    /** False for every Phase 1 sample; drives the Measured/Estimated badge. */
    isEstimated: boolean;
    hasStoredAnswer: boolean;
    sampledAt: string;
};

export type Suppression = {
    reason: "insufficient_observations";
    observations: number;
    required: number;
};

export type EngineVisibility = {
    engineId: AnswerEngineId;
    /** Answers we actually read. Excludes no_answer and failed by contract. */
    observations: number;
    namedCount: number;
    noAnswer: number;
    failed: number;
    /**
     * Share of observations naming the brand, or NULL when suppressed.
     *
     * Null rather than 0 deliberately, and callers must not coalesce it: "we
     * cannot say" and "measured zero" are opposite claims, and this business is
     * genuinely at 0% on two engines — a number that has to stay believable.
     */
    visibilityRate: number | null;
    suppressed: Suppression | null;
    provenance: EngineProvenance;
};

/** QA #35 — what a tile must be able to show about its own number. */
export type EngineProvenance = {
    engineId: AnswerEngineId;
    /** Every distinct model behind these samples. Plural at a changeover. */
    modelIds: string[];
    totalSamples: number;
    observations: number;
    firstSampledAt: string | null;
    lastSampledAt: string | null;
    /** QA #36. Estimated if ANY contributing sample was. */
    basis: "measured" | "estimated";
    /**
     * Observations whose verbatim answer is retrievable (E-8). Lower than
     * `observations` for anything sampled before answer storage existed, and the
     * drawer must say so rather than imply the evidence was never produced.
     */
    withStoredAnswer: number;
};

function summarise(engineId: AnswerEngineId, facts: SampleFact[]): EngineVisibility {
    const observations = facts.filter((f) => f.status === "ok");
    const namedCount = observations.filter((f) => f.ownBrandNamed).length;

    const times = facts.map((f) => f.sampledAt).sort();
    const modelIds = [...new Set(facts.map((f) => f.modelId).filter((m): m is string => Boolean(m)))];

    const provenance: EngineProvenance = {
        engineId,
        modelIds,
        totalSamples: facts.length,
        observations: observations.length,
        firstSampledAt: times[0] ?? null,
        lastSampledAt: times[times.length - 1] ?? null,
        basis: facts.some((f) => f.isEstimated) ? "estimated" : "measured",
        withStoredAnswer: observations.filter((f) => f.hasStoredAnswer).length,
    };

    const enough = observations.length >= MIN_OBSERVATIONS;

    return {
        engineId,
        observations: observations.length,
        namedCount,
        noAnswer: facts.filter((f) => f.status === "no_answer").length,
        failed: facts.filter((f) => f.status === "failed").length,
        visibilityRate: enough ? namedCount / observations.length : null,
        suppressed: enough
            ? null
            : {
                  reason: "insufficient_observations",
                  observations: observations.length,
                  required: MIN_OBSERVATIONS,
              },
        provenance,
    };
}

/**
 * Per-engine visibility, one entry per engine that produced any sample.
 *
 * An engine that only ever failed still appears, with a suppressed rate: it has
 * a run-health story worth telling, and omitting it would quietly shrink the
 * denominator of "engines we cover".
 */
export function computeEngineVisibility(facts: readonly SampleFact[]): EngineVisibility[] {
    const byEngine = new Map<AnswerEngineId, SampleFact[]>();
    for (const fact of facts) {
        const list = byEngine.get(fact.engineId);
        if (list) list.push(fact);
        else byEngine.set(fact.engineId, [fact]);
    }

    return [...byEngine.entries()]
        .map(([engineId, list]) => summarise(engineId, list))
        .sort((a, b) => a.engineId.localeCompare(b.engineId));
}

/**
 * Visibility across every engine pooled, or null when the pool is too small.
 *
 * Pools OBSERVATIONS, not per-engine rates: averaging rates would weight an
 * engine with three answers the same as one with twenty. Suppressed engines
 * still contribute their observations here — the reason to withhold a per-engine
 * rate is that the engine's own sample is thin, which pooling fixes.
 */
export function computeOverallVisibility(facts: readonly SampleFact[]): {
    observations: number;
    namedCount: number;
    visibilityRate: number | null;
    suppressed: Suppression | null;
} {
    const observations = facts.filter((f) => f.status === "ok");
    const namedCount = observations.filter((f) => f.ownBrandNamed).length;
    const enough = observations.length >= MIN_OBSERVATIONS;

    return {
        observations: observations.length,
        namedCount,
        visibilityRate: enough ? namedCount / observations.length : null,
        suppressed: enough
            ? null
            : { reason: "insufficient_observations", observations: observations.length, required: MIN_OBSERVATIONS },
    };
}
