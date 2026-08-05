import type { AnswerEngineId } from "../engines/engine-types";
import { getEngineDescriptor, isMeterable } from "../engines/engine-catalog";

/**
 * E-10, part 2: the daily budget guard.
 *
 * Vendor free allowances are daily buckets shared across the whole billing
 * account. This decides, before any request is dispatched, how much of a day's
 * demand may actually run — so that crossing into paid usage is a decision
 * somebody made, never a side effect of how many accounts happened to land on
 * a Tuesday.
 *
 * Scope boundary worth keeping straight:
 *
 *   - THIS guard protects free allowances. It answers "would today's volume
 *     spill past what the vendor gives us for nothing?"
 *   - E-5's ledger enforces affordability for engines that bill from the first
 *     request. ChatGPT has no free tier; every sample costs money by design,
 *     and withholding it here would block the product rather than protect it.
 *
 * Conflating the two would make the scheduler silently decide what a customer
 * can afford, which is not its job.
 */

export type EngineDemand = {
    engineId: AnswerEngineId;
    /** Samples this engine would take today, account-wide. */
    requestedSamples: number;
};

export type BudgetReason =
    /** Priced vendor with no confirmed rate — withheld, matching resolveRunnable. */
    | "engine_not_meterable"
    /** Fits inside the vendor's free daily bucket; costs nothing. */
    | "within_free_allowance"
    /** Bills from the first request by design; affordability is E-5's call. */
    | "no_free_allowance"
    /** Would exceed a free bucket and nobody authorised paying, so the excess waits. */
    | "deferred_to_protect_allowance"
    /** Explicitly authorised to spend past the free bucket. */
    | "overage_authorised";

export type BudgetOutcome = {
    engineId: AnswerEngineId;
    requested: number;
    allowed: number;
    deferred: number;
    /** Samples that will be charged. Must be 0 whenever an allowance is being protected. */
    billableUnits: number;
    costMicroUsd: number;
    reason: BudgetReason;
};

export type BudgetOptions = {
    /**
     * Per-org opt-in to spending past a free allowance. E-10 must record this in
     * the ledger BEFORE the first billable call, not after — see QA criterion #52.
     */
    overageAuthorised?: boolean;
};

function outcome(
    engineId: AnswerEngineId,
    requested: number,
    allowed: number,
    billableUnits: number,
    reason: BudgetReason
): BudgetOutcome {
    const { overageMicroUsd } = getEngineDescriptor(engineId).cost;
    return {
        engineId,
        requested,
        allowed,
        deferred: requested - allowed,
        billableUnits,
        costMicroUsd: billableUnits * overageMicroUsd,
        reason,
    };
}

/** Decide one engine's dispatch volume for a day. */
export function planEngineBudget(demand: EngineDemand, options: BudgetOptions = {}): BudgetOutcome {
    const requested = Math.max(0, Math.floor(demand.requestedSamples));
    const { engineId } = demand;

    // An engine we cannot price cannot run, however much capacity exists.
    if (!isMeterable(engineId)) {
        return outcome(engineId, requested, 0, 0, "engine_not_meterable");
    }

    const { freePerDay } = getEngineDescriptor(engineId).cost;

    // No free tier: every sample bills by design. Not this guard's decision.
    if (freePerDay <= 0) {
        return outcome(engineId, requested, requested, requested, "no_free_allowance");
    }

    if (requested <= freePerDay) {
        return outcome(engineId, requested, requested, 0, "within_free_allowance");
    }

    if (options.overageAuthorised) {
        return outcome(engineId, requested, requested, requested - freePerDay, "overage_authorised");
    }

    // Defer the excess and bill nothing. Deliberately not "run it and record the
    // cost": an unauthorised charge cannot be undone once the request is sent.
    return outcome(engineId, requested, freePerDay, 0, "deferred_to_protect_allowance");
}

export function planDailyBudget(
    demands: readonly EngineDemand[],
    options: BudgetOptions = {}
): BudgetOutcome[] {
    return demands.map((demand) => planEngineBudget(demand, options));
}

/** Total projected spend for a plan, in micro-USD. */
export function totalCostMicroUsd(outcomes: readonly BudgetOutcome[]): number {
    return outcomes.reduce((sum, o) => sum + o.costMicroUsd, 0);
}

/**
 * True when any engine is holding work back. The scheduler should re-offer
 * deferred volume in the next slot rather than dropping it silently.
 */
export function hasDeferredWork(outcomes: readonly BudgetOutcome[]): boolean {
    return outcomes.some((o) => o.deferred > 0);
}
