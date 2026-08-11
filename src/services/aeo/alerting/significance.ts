/**
 * F8.8: the significance gate.
 *
 * PRD-9 names "per-metric variance from repeat sampling (F1.13)" as the
 * input to this gate. F1.13 is not a Phase 1 item — nothing in this repo
 * samples the same prompt+engine multiple times in one window to measure
 * noise directly. Rather than fabricate that input, this uses a standard
 * two-proportion z-test on the real data that DOES exist: the named/not-named
 * rate in a recent window vs. a baseline window, both drawn from actual
 * weekly samples. This is the honest substitute for the missing dependency,
 * not a workaround pretending to be the original design — flagged here, not
 * silently presented as F1.13-equivalent.
 */

/** Standard normal CDF, Zelen & Severo (1964) approximation — accurate to ~7.5e-8, no external stats dependency. */
function standardNormalCdf(z: number): number {
    const b1 = 0.319381530;
    const b2 = -0.356563782;
    const b3 = 1.781477937;
    const b4 = -1.821255978;
    const b5 = 1.330274429;
    const p = 0.2316419;
    const c = 0.39894228; // 1/sqrt(2*pi)

    const az = Math.abs(z);
    const t = 1 / (1 + p * az);
    const poly = t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5))));
    const density = c * Math.exp((-az * az) / 2);
    const tailArea = density * poly;

    return z >= 0 ? 1 - tailArea : tailArea;
}

export type ProportionWindow = { successes: number; trials: number };

export type SignificanceResult =
    | { significant: false; reason: "insufficient_samples"; baselineTrials: number; recentTrials: number; required: number }
    | {
          significant: boolean;
          reason: "evaluated";
          baselineRate: number;
          recentRate: number;
          deltaPercentagePoints: number;
          pValue: number;
          zScore: number;
      };

/** Below this in EITHER window, a rate is a coin flip, not a measurement — matches MIN_OBSERVATIONS elsewhere in this module. */
export const MIN_TRIALS_PER_WINDOW = 3;

/** Standard two-tailed significance threshold. */
const P_VALUE_THRESHOLD = 0.05;

/**
 * A statistically significant delta that is too small to matter is still not
 * worth an email — "your visibility moved from 51% to 53%" is real but not
 * actionable. Requires both p < 0.05 AND a real practical difference.
 */
const MIN_PRACTICAL_DELTA_POINTS = 15;

export function testProportionChange(baseline: ProportionWindow, recent: ProportionWindow): SignificanceResult {
    if (baseline.trials < MIN_TRIALS_PER_WINDOW || recent.trials < MIN_TRIALS_PER_WINDOW) {
        return {
            significant: false,
            reason: "insufficient_samples",
            baselineTrials: baseline.trials,
            recentTrials: recent.trials,
            required: MIN_TRIALS_PER_WINDOW,
        };
    }

    const p1 = baseline.successes / baseline.trials;
    const p2 = recent.successes / recent.trials;
    const pooled = (baseline.successes + recent.successes) / (baseline.trials + recent.trials);

    // Both proportions are ~0 or ~1 with no variance either side of the
    // pool — e.g. named in every sample, both windows. Nothing changed;
    // not an error, not a divide-by-zero case to special-case around.
    const se = Math.sqrt(pooled * (1 - pooled) * (1 / baseline.trials + 1 / recent.trials));
    const zScore = se === 0 ? 0 : (p2 - p1) / se;
    const pValue = 2 * (1 - standardNormalCdf(Math.abs(zScore)));
    const deltaPercentagePoints = (p2 - p1) * 100;

    return {
        significant: pValue < P_VALUE_THRESHOLD && Math.abs(deltaPercentagePoints) >= MIN_PRACTICAL_DELTA_POINTS,
        reason: "evaluated",
        baselineRate: p1,
        recentRate: p2,
        deltaPercentagePoints,
        pValue,
        zScore,
    };
}
