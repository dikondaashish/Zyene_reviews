import type { Reservation } from "./quota-reservation";

/**
 * E-5 rollups: turning reservation rows into the two numbers the rest of the
 * system asks for.
 *
 * These are separate on purpose. Allowance accounting and money accounting look
 * similar and are not: a grounded call inside a free bucket consumes a unit and
 * costs nothing. Reading the wrong one is the failure this ledger exists to
 * prevent, so they do not share a function.
 */

/**
 * Units a day should be treated as having consumed against the free allowance.
 *
 * Reads `settledUnits`, never `billableUnits`. A call inside the free bucket
 * costs nothing but still drains it; counting money here would report an
 * untouched allowance and let the guard authorise further spend.
 *
 * In-flight reservations count at their full claim: assuming they will be used
 * is the conservative direction, and the alternative is authorising spend
 * against capacity that is already committed.
 *
 * A settled row counts `settledUnits + overrunUnits`. The overrun is consumption
 * the vendor reported beyond what we claimed — real drain on the bucket, and
 * leaving it out here would be the same undercount the column exists to stop.
 */
export function consumedUnits(reservations: readonly Reservation[]): number {
    return reservations.reduce((sum, r) => {
        if (r.state === "reserved") return sum + r.reservedUnits;
        if (r.state === "settled") return sum + r.settledUnits + r.overrunUnits;
        return sum;
    }, 0);
}

/** Units that actually cost money. Distinct from consumption — see consumedUnits. */
export function billedUnits(reservations: readonly Reservation[]): number {
    return reservations.reduce((sum, r) => sum + r.billableUnits, 0);
}

export function settledCostMicroUsd(reservations: readonly Reservation[]): number {
    return reservations.reduce((sum, r) => sum + r.costMicroUsd, 0);
}
