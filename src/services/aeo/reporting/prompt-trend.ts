import type { AnswerEngineId } from "../engines/engine-types";

/** F4.5: one prompt's per-engine visibility over time, from real sampled answers. */
export type PromptSampleFact = {
    engineId: AnswerEngineId;
    status: "ok" | "no_answer" | "failed";
    /** Named in prose, cited-only excluded — same rule as the pooled visibility score. */
    ownBrandNamed: boolean;
    sampledAt: string;
};

export type WeeklyTrendPoint = {
    weekStart: string;
    observations: number;
    named: number;
    /** Null, never 0, for a week with no observations — a gap, never interpolated (PRD-8). */
    rate: number | null;
};

function weekStartIso(dateIso: string): string {
    const d = new Date(dateIso);
    const diff = (d.getUTCDay() + 6) % 7; // days since Monday, Sunday wraps to 6
    const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff));
    return monday.toISOString().slice(0, 10);
}

/** The `weeks` window's Monday, most recent last — the x-axis this buckets onto. */
export function recentWeekStarts(count: number, now: Date): string[] {
    const diff = (now.getUTCDay() + 6) % 7;
    const thisMonday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
    const weeks: string[] = [];
    for (let i = count - 1; i >= 0; i -= 1) {
        const d = new Date(thisMonday);
        d.setUTCDate(d.getUTCDate() - i * 7);
        weeks.push(d.toISOString().slice(0, 10));
    }
    return weeks;
}

/**
 * Weekly visibility rate per engine, over a fixed set of week-starts.
 *
 * Only `status: "ok"` samples count as observations — matching
 * visibility-metrics.ts's pooled rate exactly, so a prompt's trend chart
 * never disagrees with its own summary tile about what an "observation" is.
 */
export function computePromptTrend(
    facts: readonly PromptSampleFact[],
    weeks: readonly string[]
): Map<AnswerEngineId, WeeklyTrendPoint[]> {
    const weekSet = new Set(weeks);
    const byEngine = new Map<AnswerEngineId, Map<string, { observations: number; named: number }>>();

    for (const fact of facts) {
        const week = weekStartIso(fact.sampledAt);
        if (!weekSet.has(week)) continue;

        // Registered regardless of status: an engine that only ever failed in
        // this window still has a story (a flat line of gaps), and dropping it
        // entirely would look identical to "we never tried this engine" —
        // matching computeEngineVisibility's "still appears" precedent.
        let engineMap = byEngine.get(fact.engineId);
        if (!engineMap) {
            engineMap = new Map();
            byEngine.set(fact.engineId, engineMap);
        }
        if (fact.status !== "ok") continue;

        const bucket = engineMap.get(week) ?? { observations: 0, named: 0 };
        bucket.observations += 1;
        if (fact.ownBrandNamed) bucket.named += 1;
        engineMap.set(week, bucket);
    }

    const result = new Map<AnswerEngineId, WeeklyTrendPoint[]>();
    for (const [engineId, engineMap] of byEngine) {
        result.set(
            engineId,
            weeks.map((week) => {
                const bucket = engineMap.get(week);
                return {
                    weekStart: week,
                    observations: bucket?.observations ?? 0,
                    named: bucket?.named ?? 0,
                    rate: bucket && bucket.observations > 0 ? bucket.named / bucket.observations : null,
                };
            })
        );
    }
    return result;
}
