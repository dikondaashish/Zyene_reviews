import type { AnswerEngineId, EngineSampleResult } from "../engines/engine-types";
import { billableUnits } from "../engines/engine-types";

/**
 * E-5: quota reservations — the write-ahead half of the ledger.
 *
 * Charging a vendor and writing our own row are separate systems with no shared
 * transaction, so the window between them cannot be closed. Ordering only
 * chooses which error falls out of it:
 *
 *   call then record  -> a crash leaves spend that happened but was not counted.
 *                        The budget guard reads this ledger to decide what is
 *                        left of a free allowance, so an undercount makes it
 *                        authorise more spend. The error amplifies itself.
 *   record then call  -> a crash leaves spend counted that never happened. The
 *                        guard turns conservative and we lose some free capacity.
 *                        Bounded, detectable, reversible.
 *
 * So units are reserved BEFORE dispatch, then settled against what the engine
 * actually consumed — pure write-ahead would overcount every failed call
 * forever, and 429s are not rare. EngineSampleResult carries costUnits on every
 * variant, including `failed`, precisely so reconciliation can tell the
 * difference between a failure that cost nothing and one that did.
 *
 * Pure functions only. Persistence belongs to E-7, rollups to quota-rollup.ts,
 * and the recovery path (release/expire) to quota-sweep.ts — sweeping asserts
 * that nothing was consumed, which is the opposite claim to settling.
 */

/**
 * `reserved` = claimed, call in flight, counts as consumed. `settled` = result
 * known, figures final. `released` = abandoned before dispatch. `expired` =
 * never settled within the TTL, i.e. a crashed run. The last two free the units.
 */
export type ReservationState = "reserved" | "settled" | "released" | "expired";

export type Reservation = {
    /**
     * Stable across retries of the same work. Inngest `step.run` is at-least-once:
     * a process that dies mid-step re-runs that step whole, so without this a
     * retry would open a second reservation for a call that already happened.
     */
    idempotencyKey: string;
    organizationId: string;
    engineId: AnswerEngineId;
    /** UTC date the units count against; free allowances are daily buckets. */
    usageDate: string;
    /** Units claimed up front, before the engine is called. */
    reservedUnits: number;
    state: ReservationState;
    reservedAt: string;
    settledAt: string | null;
    /**
     * Units the engine actually consumed against the vendor's daily allowance.
     * Distinct from `billableUnits`: a call inside a free bucket consumes a unit
     * and costs nothing. Allowance accounting reads this.
     */
    settledUnits: number;
    /**
     * Consumption reported ABOVE the claim. costUnits is adapter-reported and
     * only floored at zero, so a vendor can report more than we pessimistically
     * claimed; dropping the excess would record less consumption than really
     * happened and let the guard authorise spend against a bucket that is
     * already gone. Allowance accounting reads `settledUnits + overrunUnits`.
     * Non-zero also means `costMicroUsd` is a floor, not an exact figure.
     */
    overrunUnits: number;
    /** The subset of `settledUnits` that cost money. Money accounting reads this. */
    billableUnits: number;
    costMicroUsd: number;
    /**
     * Whether spending past the free allowance was authorised for this
     * reservation. Recorded here, before dispatch, so the authorisation survives
     * a crash — QA criterion #52.
     */
    overageAuthorised: boolean;
};

export type ReservationInput = {
    organizationId: string;
    engineId: AnswerEngineId;
    usageDate: string;
    units: number;
    overageAuthorised: boolean;
    runId: string;
    promptId: string;
    attempt: number;
    now?: Date;
};

/**
 * Deterministic key for one unit of sampling work. Must not include a timestamp
 * or random component, or a retry produces a different key and the duplicate
 * protection it exists for disappears.
 */
export function reservationKey(input: {
    runId: string;
    promptId: string;
    engineId: AnswerEngineId;
    attempt: number;
}): string {
    return `${input.runId}:${input.promptId}:${input.engineId}:${input.attempt}`;
}

/** Claim units ahead of dispatch. Nothing is billed yet. */
export function openReservation(input: ReservationInput): Reservation {
    return {
        idempotencyKey: reservationKey(input),
        organizationId: input.organizationId,
        engineId: input.engineId,
        usageDate: input.usageDate,
        reservedUnits: Math.max(0, Math.floor(input.units)),
        state: "reserved",
        reservedAt: (input.now ?? new Date()).toISOString(),
        settledAt: null,
        settledUnits: 0,
        overrunUnits: 0,
        billableUnits: 0,
        costMicroUsd: 0,
        overageAuthorised: input.overageAuthorised,
    };
}

/** Exported for quota-sweep.ts, which shares this precondition. */
export function assertReservationOpen(reservation: Reservation, action: string): void {
    if (reservation.state !== "reserved") {
        // Settling twice would double-count spend; releasing a settled
        // reservation would erase it. Both are silent accounting corruption.
        throw new Error(
            `Cannot ${action} a reservation in state "${reservation.state}" (${reservation.idempotencyKey})`
        );
    }
}

export type Settlement = {
    /**
     * Consumed units falling OUTSIDE the free allowance. Supplied by the budget
     * guard rather than derived here: billability depends on how much of the
     * day's bucket was already gone, which one reservation cannot see.
     */
    billableUnits: number;
    /**
     * What was actually spent. Passed in, not recomputed from the catalog — the
     * catalog holds our *expected* rate, and recomputing would paper over a
     * vendor price change.
     */
    costMicroUsd: number;
};

/**
 * Reconcile against what the engine actually consumed and what it cost.
 *
 * Consumption comes from the results (every sample that used vendor quota);
 * the billable split comes from the caller. Deriving billable from the results
 * alone would count a free-allowance call as costing money, or — worse —
 * record zero consumption for it, which would tell the budget guard the daily
 * bucket is untouched and let it authorise more spend.
 */
export function settleReservation(
    reservation: Reservation,
    results: readonly EngineSampleResult[],
    settlement: Settlement,
    now?: Date
): Reservation {
    assertReservationOpen(reservation, "settle");
    const consumed = results.reduce((sum, r) => sum + billableUnits(r), 0);
    // Split rather than clamp. The claim is a ceiling on what we authorised, not
    // on what the vendor did; discarding the excess would under-report the day.
    const settled = Math.min(consumed, reservation.reservedUnits);
    const overrun = consumed - settled;
    const billed = Math.max(0, Math.min(Math.floor(settlement.billableUnits), consumed));
    return {
        ...reservation,
        state: "settled",
        settledAt: (now ?? new Date()).toISOString(),
        settledUnits: settled,
        overrunUnits: overrun,
        billableUnits: billed,
        costMicroUsd: billed > 0 ? Math.max(0, Math.round(settlement.costMicroUsd)) : 0,
    };
}
