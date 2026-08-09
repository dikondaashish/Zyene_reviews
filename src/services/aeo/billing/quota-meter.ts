import { ONE_TEST_MICRO_USD, PLAN_CREDIT_GRANTS_MICRO_USD } from "./billing-constants";

/**
 * F4.9: prompts x engines x cadence vs. plan allowance, projected forward.
 *
 * RUNS_PER_MONTH is WEEKLY (52/12), not the PRD-1 "weekly Starter, daily
 * Professional" split. The scheduler that actually dispatches runs
 * (is-business-due-now.ts / crawl-slot.ts's AEO-sampling counterpart,
 * sampling-slot.ts) assigns every business ONE slot regardless of plan —
 * there is no per-plan cadence in the code today. A meter that assumed the
 * PRD's daily-for-Professional cadence would project a number nobody is
 * actually being run against; this projects what the scheduler will really
 * do, and flags the gap in `cadenceNote` rather than hiding it.
 */
const RUNS_PER_MONTH = 52 / 12;

export type QuotaMeterResult = {
    activePrompts: number;
    runnableEngines: number;
    dispatchUnitsPerRun: number;
    runsPerMonth: number;
    /** Upper bound: assumes every dispatched unit reaches status "ok" and is billed. */
    projectedMonthlyMicroUsd: number;
    planId: string | null;
    allowanceMicroUsd: number | null;
    balanceMicroUsd: number | null;
    projectedExceedsAllowance: boolean | null;
};

export function computeQuotaMeter(input: {
    activePrompts: number;
    runnableEngines: number;
    planId: string | null;
    balanceMicroUsd: number | null;
}): QuotaMeterResult {
    const dispatchUnitsPerRun = input.activePrompts * input.runnableEngines;
    const projectedMonthlyMicroUsd = Math.round(dispatchUnitsPerRun * RUNS_PER_MONTH * ONE_TEST_MICRO_USD);
    const allowanceMicroUsd = input.planId ? (PLAN_CREDIT_GRANTS_MICRO_USD[input.planId] ?? null) : null;

    return {
        activePrompts: input.activePrompts,
        runnableEngines: input.runnableEngines,
        dispatchUnitsPerRun,
        runsPerMonth: RUNS_PER_MONTH,
        projectedMonthlyMicroUsd,
        planId: input.planId,
        allowanceMicroUsd,
        balanceMicroUsd: input.balanceMicroUsd,
        projectedExceedsAllowance:
            allowanceMicroUsd === null ? null : projectedMonthlyMicroUsd > allowanceMicroUsd,
    };
}
