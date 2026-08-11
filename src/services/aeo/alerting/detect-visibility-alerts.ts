import { testProportionChange, type ProportionWindow } from "./significance";
import type { AnswerEngineId } from "../engines/engine-types";

/** One observed sample, newest-first ordering expected within each (prompt, engine) group. */
export type VisibilitySampleFact = {
    promptId: string;
    promptText: string;
    engineId: AnswerEngineId;
    status: "ok" | "no_answer" | "failed";
    ownBrandNamed: boolean;
    sampledAt: string;
};

export type VisibilityAlert = {
    promptId: string;
    promptText: string;
    engineId: AnswerEngineId;
    direction: "drop" | "gain";
    baselineRate: number;
    recentRate: number;
    deltaPercentagePoints: number;
    pValue: number;
    recentTrials: number;
    baselineTrials: number;
};

/**
 * F8.1: visibility-threshold alerts, gated by F8.8's significance test.
 *
 * Splits each (prompt, engine)'s observed samples into a recent window and
 * the baseline window immediately before it — both drawn from real weekly
 * samples, newest-first. `windowSize` samples in EACH window means a
 * (prompt, engine) needs `windowSize * 2` weeks of history before it is
 * eligible for an alert at all, which is a stronger version of PRD-9's
 * "suppress the first 2 cycles" edge case, not a weaker one.
 */
export function detectVisibilityAlerts(
    factsByPromptEngine: ReadonlyMap<string, readonly VisibilitySampleFact[]>,
    windowSize = 3
): VisibilityAlert[] {
    const alerts: VisibilityAlert[] = [];

    for (const facts of factsByPromptEngine.values()) {
        const observed = facts.filter((f) => f.status === "ok");
        if (observed.length < windowSize * 2) continue;

        const recent = observed.slice(0, windowSize);
        const baseline = observed.slice(windowSize, windowSize * 2);

        const recentWindow: ProportionWindow = {
            trials: recent.length,
            successes: recent.filter((f) => f.ownBrandNamed).length,
        };
        const baselineWindow: ProportionWindow = {
            trials: baseline.length,
            successes: baseline.filter((f) => f.ownBrandNamed).length,
        };

        const result = testProportionChange(baselineWindow, recentWindow);
        if (!result.significant || result.reason !== "evaluated") continue;

        alerts.push({
            promptId: recent[0].promptId,
            promptText: recent[0].promptText,
            engineId: recent[0].engineId,
            direction: result.deltaPercentagePoints < 0 ? "drop" : "gain",
            baselineRate: result.baselineRate,
            recentRate: result.recentRate,
            deltaPercentagePoints: result.deltaPercentagePoints,
            pValue: result.pValue,
            recentTrials: recentWindow.trials,
            baselineTrials: baselineWindow.trials,
        });
    }

    return alerts;
}

/** Groups flat sample facts by (promptId, engineId), preserving whatever order they arrived in. */
export function groupByPromptEngine(
    facts: readonly VisibilitySampleFact[]
): Map<string, VisibilitySampleFact[]> {
    const grouped = new Map<string, VisibilitySampleFact[]>();
    for (const fact of facts) {
        const key = `${fact.promptId}:${fact.engineId}`;
        const list = grouped.get(key);
        if (list) list.push(fact);
        else grouped.set(key, [fact]);
    }
    return grouped;
}
