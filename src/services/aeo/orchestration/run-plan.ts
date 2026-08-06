import type { AnswerEngineId, EngineLocale } from "../engines/engine-types";
import type { EngineAvailability, EngineRegistry } from "../engines/engine-registry";
import { planEngineBudget, type BudgetOutcome } from "../scheduler/daily-budget";

/**
 * E-7 planning, as a pure function.
 *
 * The parent decides WHAT to dispatch; children decide nothing. Keeping the
 * decision here — with no I/O — means the fan-out can be asserted directly in
 * tests, and means the expensive part (one child per unit) is never reached by
 * a run that should not have started.
 *
 * What this deliberately does NOT do is authorise spend. planEngineBudget is
 * pure and stateless, so two runs planning concurrently both see the same
 * remaining allowance and both believe they fit. Only the reservation insert
 * serializes, so the numbers here are a PROJECTION used to decide what is worth
 * dispatching. The binding decision happens per unit, in aeo_reserve_quota.
 */

export type PromptToSample = {
    promptId: string;
    promptText: string;
    locale: EngineLocale;
};

export type RunPlanInput = {
    runId: string;
    businessId: string;
    organizationId: string;
    usageDate: string;
    prompts: readonly PromptToSample[];
    requestedEngines: readonly AnswerEngineId[];
    /** Repeat sampling (F1.13). One observation per prompt is the default. */
    attemptsPerPrompt?: number;
    overageAuthorised?: boolean;
    /** Per-engine units already consumed today, from the E-5 ledger. */
    consumedByEngine?: Readonly<Partial<Record<AnswerEngineId, number>>>;
};

/** One unit of work: exactly the grain of an idempotency key and of a child run. */
export type DispatchRequest = {
    runId: string;
    businessId: string;
    organizationId: string;
    promptId: string;
    promptText: string;
    engineId: AnswerEngineId;
    attempt: number;
    locale: EngineLocale;
    usageDate: string;
    overageAuthorised: boolean;
    requestedUnits: number;
};

export type RunPlan = {
    dispatches: DispatchRequest[];
    /** Engines dropped before planning: unimplemented, unconfigured, or unpriced. */
    withheld: EngineAvailability[];
    /** Per-engine projection. Advisory — see the note on serialization above. */
    budgets: BudgetOutcome[];
    /** Units the projection expects not to fit inside today's allowance. */
    projectedDeferredUnits: number;
    /**
     * Set when there is nothing to dispatch. The run should be recorded with this
     * as its reason rather than left looking like a success that produced nothing.
     */
    emptyReason: "no_active_prompts" | "no_runnable_engines" | "budget_exhausted" | null;
};

export function planRun(input: RunPlanInput, registry: EngineRegistry): RunPlan {
    const attempts = Math.max(1, Math.floor(input.attemptsPerPrompt ?? 1));
    const overageAuthorised = input.overageAuthorised ?? false;

    // Withholding happens before budgeting, not after: an engine we cannot price
    // must never reach a cost calculation that might make it look affordable.
    const { runnable, withheld } = registry.resolveRunnable(input.requestedEngines);

    const empty = (reason: RunPlan["emptyReason"]): RunPlan => ({
        dispatches: [],
        withheld,
        budgets: [],
        projectedDeferredUnits: 0,
        emptyReason: reason,
    });

    if (input.prompts.length === 0) return empty("no_active_prompts");
    if (runnable.length === 0) return empty("no_runnable_engines");

    const dispatches: DispatchRequest[] = [];
    const budgets: BudgetOutcome[] = [];
    let projectedDeferredUnits = 0;

    for (const adapter of runnable) {
        const demand = input.prompts.length * attempts;
        const budget = planEngineBudget(
            { engineId: adapter.id, requestedSamples: demand },
            {
                overageAuthorised,
                alreadyUsedToday: input.consumedByEngine?.[adapter.id] ?? 0,
            }
        );
        budgets.push(budget);
        projectedDeferredUnits += budget.deferred;

        // Emit only as many units as the projection expects to fit. Emitting all
        // of them and letting each child be refused would still pay Inngest for
        // the fan-out, and would fill the ledger with deferred rows that say
        // nothing the budget did not already know.
        let remaining = budget.allowed;
        if (remaining <= 0) continue;

        for (const prompt of input.prompts) {
            for (let attempt = 1; attempt <= attempts; attempt += 1) {
                if (remaining <= 0) break;
                remaining -= 1;
                dispatches.push({
                    runId: input.runId,
                    businessId: input.businessId,
                    organizationId: input.organizationId,
                    promptId: prompt.promptId,
                    promptText: prompt.promptText,
                    engineId: adapter.id,
                    attempt,
                    locale: prompt.locale,
                    usageDate: input.usageDate,
                    overageAuthorised,
                    requestedUnits: 1,
                });
            }
        }
    }

    return {
        dispatches,
        withheld,
        budgets,
        projectedDeferredUnits,
        emptyReason: dispatches.length === 0 ? "budget_exhausted" : null,
    };
}
