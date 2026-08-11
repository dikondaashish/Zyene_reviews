import { billableUnits } from "../engines/engine-types";
import type { EngineSampleResult } from "../engines/engine-types";

/** What the reservation granted us, reduced to the two numbers settlement needs. */
export type ReconcileClaim = {
    grantedUnits: number;
    /** Units the reservation said would be charged. Zero inside a free allowance. */
    claimBillableUnits: number;
};

export type Settlement = {
    settledUnits: number;
    overrunUnits: number;
    billableUnits: number;
    costMicroUsd: number;
};

/**
 * Turns one engine response into the four numbers the ledger stores.
 *
 * Pure, and separate from dispatch because this is the arithmetic that decides
 * what a customer is charged — it should be assertable directly, without a
 * reservation store, a step runner or a fake Inngest around it.
 *
 * Consumption and cost are different quantities: a call inside a free allowance
 * consumes a unit and costs nothing. `costUnits` is adapter-reported and
 * unbounded above, so it can exceed what we pessimistically claimed; the excess
 * is split into `overrunUnits` rather than dropped, because discarding it would
 * tell the budget guard the bucket is less drained than it is — the
 * self-amplifying undercount this ledger exists to prevent.
 */
export function reconcileUnit(
    result: EngineSampleResult,
    claim: ReconcileClaim,
    catalogRateMicroUsd: number
): Settlement {
    const consumed = billableUnits(result);
    const settledUnits = Math.min(consumed, claim.grantedUnits);
    const overrunUnits = consumed - settledUnits;
    const claimed = Math.min(claim.claimBillableUnits, consumed);

    /*
     * Prefer the vendor's reported figure over `units x catalog rate`: the rate
     * is a planning number from a quote, the report is the invoice, and for
     * token-priced engines the two genuinely differ per request.
     *
     * A REPORTED ZERO IS DATA, NOT A MISSING VALUE — `usdToMicroUsd` returns
     * undefined for an unusable figure precisely so 0 can mean "charged
     * nothing", which is what DataForSEO says when it rejects a task it still
     * answered on the wire. Cost and billable units are therefore decided
     * together: a unit we pay nothing for is not a billable unit, and claiming
     * one at zero cost breaks the ledger's
     * `(billable_units = 0) = (cost_micro_usd = 0)` invariant. Reading through
     * `??` treated that 0 as "no figure", kept the claim, and threw on settle —
     * aborting the run with the vendor already called. `settledUnits` still
     * counts the unit: quota was consumed even though money was not.
     */
    const reported = result.reportedCostMicroUsd;
    const billed = reported === 0 ? 0 : claimed;

    return {
        settledUnits,
        overrunUnits,
        billableUnits: billed,
        costMicroUsd: billed > 0 ? (reported ?? billed * catalogRateMicroUsd) : 0,
    };
}
