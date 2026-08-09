import { describe, expect, it } from "vitest";

import { computeQuotaMeter } from "../../src/services/aeo/billing/quota-meter";
import { ONE_TEST_MICRO_USD, PLAN_CREDIT_GRANTS_MICRO_USD } from "../../src/services/aeo/billing/billing-constants";

describe("computeQuotaMeter", () => {
    it("multiplies prompts x engines x weekly cadence x per-test cost", () => {
        const result = computeQuotaMeter({
            activePrompts: 10,
            runnableEngines: 2,
            planId: "starter_monthly",
            balanceMicroUsd: 1_000_000,
        });
        expect(result.dispatchUnitsPerRun).toBe(20);
        expect(result.runsPerMonth).toBeCloseTo(52 / 12, 5);
        expect(result.projectedMonthlyMicroUsd).toBe(Math.round(20 * (52 / 12) * ONE_TEST_MICRO_USD));
    });

    it("flags when the projection exceeds the plan's allowance", () => {
        const result = computeQuotaMeter({
            activePrompts: 50,
            runnableEngines: 3,
            planId: "starter_monthly",
            balanceMicroUsd: 0,
        });
        expect(result.allowanceMicroUsd).toBe(PLAN_CREDIT_GRANTS_MICRO_USD.starter_monthly);
        expect(result.projectedExceedsAllowance).toBe(true);
    });

    /**
     * At $2.50/test and weekly cadence, even ONE active prompt on ONE engine
     * projects to ~$10.83/month — already over Professional's $10 allowance.
     * There is no nonzero real workload today that fits under either plan's
     * allowance; this is a real property of the current pricing + cadence,
     * not a test artifact, and the quota meter should surface it rather than
     * a meter that never fires would.
     */
    it("does not flag when there is genuinely nothing to project", () => {
        const result = computeQuotaMeter({
            activePrompts: 0,
            runnableEngines: 3,
            planId: "professional_monthly",
            balanceMicroUsd: 10_000_000,
        });
        expect(result.projectedExceedsAllowance).toBe(false);
    });

    it("reports an unknown allowance as null, not zero, for a plan not in the catalog", () => {
        const result = computeQuotaMeter({
            activePrompts: 5,
            runnableEngines: 2,
            planId: "legacy_free",
            balanceMicroUsd: null,
        });
        expect(result.allowanceMicroUsd).toBeNull();
        expect(result.projectedExceedsAllowance).toBeNull();
    });

    it("projects zero spend with zero active prompts, not a suppressed/null state", () => {
        const result = computeQuotaMeter({
            activePrompts: 0,
            runnableEngines: 3,
            planId: "starter_monthly",
            balanceMicroUsd: 5_000_000,
        });
        expect(result.projectedMonthlyMicroUsd).toBe(0);
        expect(result.projectedExceedsAllowance).toBe(false);
    });
});
