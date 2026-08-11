import { describe, expect, it } from "vitest";
import { testProportionChange, MIN_TRIALS_PER_WINDOW } from "../../src/services/aeo/alerting/significance";

describe("testProportionChange — insufficient samples", () => {
    it("refuses to evaluate when the baseline window is too thin", () => {
        const result = testProportionChange({ successes: 1, trials: 2 }, { successes: 5, trials: 10 });
        expect(result).toEqual({
            significant: false,
            reason: "insufficient_samples",
            baselineTrials: 2,
            recentTrials: 10,
            required: MIN_TRIALS_PER_WINDOW,
        });
    });

    it("refuses to evaluate when the recent window is too thin", () => {
        const result = testProportionChange({ successes: 5, trials: 10 }, { successes: 1, trials: 2 });
        expect(result.significant).toBe(false);
        expect(result.reason).toBe("insufficient_samples");
    });
});

describe("testProportionChange — real-shaped scenarios", () => {
    it("flags a real, large, well-sampled drop as significant", () => {
        // Named 9/10 at baseline, 1/10 recently — a real, dramatic collapse.
        const result = testProportionChange({ successes: 9, trials: 10 }, { successes: 1, trials: 10 });
        expect(result.reason).toBe("evaluated");
        if (result.reason !== "evaluated") throw new Error("unreachable");
        expect(result.significant).toBe(true);
        expect(result.deltaPercentagePoints).toBeLessThan(0);
    });

    it("flags a real, large increase as significant", () => {
        const result = testProportionChange({ successes: 1, trials: 10 }, { successes: 9, trials: 10 });
        expect(result.reason).toBe("evaluated");
        if (result.reason !== "evaluated") throw new Error("unreachable");
        expect(result.significant).toBe(true);
        expect(result.deltaPercentagePoints).toBeGreaterThan(0);
    });

    it("does not flag a small fluctuation within noise as significant", () => {
        // 5/10 vs 6/10 — barely moved, and could easily be one coin flip.
        const result = testProportionChange({ successes: 5, trials: 10 }, { successes: 6, trials: 10 });
        expect(result.significant).toBe(false);
    });

    it("does not flag identical rates as significant", () => {
        const result = testProportionChange({ successes: 5, trials: 10 }, { successes: 5, trials: 10 });
        expect(result.significant).toBe(false);
        if (result.reason !== "evaluated") throw new Error("unreachable");
        expect(result.deltaPercentagePoints).toBe(0);
        expect(result.pValue).toBeCloseTo(1, 6);
    });

    it("does not flag both-100% (or both-0%) as significant — no variance, nothing changed", () => {
        const bothFull = testProportionChange({ successes: 10, trials: 10 }, { successes: 10, trials: 10 });
        expect(bothFull.significant).toBe(false);
        const bothZero = testProportionChange({ successes: 0, trials: 10 }, { successes: 0, trials: 10 });
        expect(bothZero.significant).toBe(false);
    });

    it("requires BOTH statistical significance and a practically meaningful delta — large N, tiny real move", () => {
        // 500/1000 vs 520/1000: p-value can be small at this N, but a 2-point
        // move should not by itself justify an email.
        const result = testProportionChange({ successes: 500, trials: 1000 }, { successes: 520, trials: 1000 });
        expect(result.reason).toBe("evaluated");
        if (result.reason !== "evaluated") throw new Error("unreachable");
        expect(Math.abs(result.deltaPercentagePoints)).toBeLessThan(15);
        expect(result.significant).toBe(false);
    });

    it("never throws and never returns NaN across the full proportion range", () => {
        for (let s1 = 0; s1 <= 10; s1++) {
            for (let s2 = 0; s2 <= 10; s2++) {
                const result = testProportionChange({ successes: s1, trials: 10 }, { successes: s2, trials: 10 });
                if (result.reason === "evaluated") {
                    expect(Number.isNaN(result.pValue)).toBe(false);
                    expect(Number.isNaN(result.zScore)).toBe(false);
                }
            }
        }
    });
});

describe("standardNormalCdf (indirectly, via known p-values at z-thresholds)", () => {
    it("z ≈ 1.96 lands at the conventional two-tailed p = 0.05 boundary", () => {
        // Constructed so the z-score is close to 1.96: verifies the CDF
        // approximation against a well-known reference point, not just internal consistency.
        // n1=n2=100, p1=0.5 gives SE ≈ 0.0707; delta of ~13.86pp gives z ≈ 1.96.
        const result = testProportionChange({ successes: 50, trials: 100 }, { successes: 64, trials: 100 });
        if (result.reason !== "evaluated") throw new Error("unreachable");
        expect(result.zScore).toBeGreaterThan(1.9);
        expect(result.zScore).toBeLessThan(2.1);
        expect(result.pValue).toBeGreaterThan(0.02);
        expect(result.pValue).toBeLessThan(0.08);
    });

    it("p-value decreases monotonically as the delta grows at fixed large N", () => {
        const small = testProportionChange({ successes: 500, trials: 1000 }, { successes: 550, trials: 1000 });
        const large = testProportionChange({ successes: 500, trials: 1000 }, { successes: 700, trials: 1000 });
        if (small.reason !== "evaluated" || large.reason !== "evaluated") throw new Error("unreachable");
        expect(large.pValue).toBeLessThan(small.pValue);
    });
});
