/**
 * The cost model for an answer engine, separated from the catalog that lists them.
 *
 * Split out because "which engines exist" and "what an engine costs" are read by
 * different callers for different reasons: the coverage panel wants the former,
 * the budget guard and the ledger want the latter. Keeping the arithmetic here,
 * independent of any particular engine, also means it can be tested directly
 * against the written quote rather than only through a catalog lookup.
 */

export type EngineCostConfidence =
    /** Contracted or published rate, confirmed in writing for `pinnedModelId`. */
    | "verified"
    /** Published list price, not yet contracted. */
    | "estimated"
    /** No reliable figure. Must not be enabled for paid runs. */
    | "unverified";

export type EngineCost = {
    /**
     * Cost per sample once the free allowance is exhausted, in micro-USD
     * (millionths of a dollar) to keep integer math.
     */
    overageMicroUsd: number;
    /**
     * Samples per day at no charge, across the whole billing account — not per
     * business, and in some cases shared across several models of one family.
     * Zero means every sample bills.
     *
     * This is a DAILY bucket, which makes run scheduling a cost lever: bursting
     * every account into one day forfeits the other six days of allowance. E-10
     * smooths runs across the week for exactly this reason.
     *
     * Note the bucket size changes the STAKES of bad scheduling, not just the
     * headroom — a smaller allowance makes a burst cost proportionally more.
     */
    freePerDay: number;
    confidence: EngineCostConfidence;
};

/**
 * Whether this engine may be used in a run that spends money.
 *
 * Unverified pricing is a hard block: we will not bill a customer for a vendor
 * whose rate we cannot state. This is enforced in code rather than left to
 * policy because an unquoted vendor must not be able to start charging by
 * someone simply wiring up its adapter.
 */
export function isCostMeterable(cost: EngineCost): boolean {
    return cost.confidence !== "unverified";
}

/**
 * Cost of a day's sampling at this rate, honouring the free allowance.
 *
 * Takes account-wide samples per day, not per-business: free buckets are shared,
 * so per-business apportionment must be done by the caller after this returns.
 */
export function dailyCostMicroUsd(cost: EngineCost, samplesPerDay: number): number {
    const billable = Math.max(0, Math.floor(samplesPerDay) - cost.freePerDay);
    return billable * cost.overageMicroUsd;
}
