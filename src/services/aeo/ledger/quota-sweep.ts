import type { Reservation } from "./quota-reservation";
import { assertReservationOpen } from "./quota-reservation";

/**
 * E-5 recovery path: returning units claimed by work that never finished.
 *
 * Separate from quota-reservation.ts, which owns the live path (claim, then
 * reconcile against what the engine actually did). These two look alike — both
 * move a reservation out of `reserved` and both write a terminal timestamp — and
 * they mean opposite things. Settling records consumption that happened;
 * sweeping asserts that none did. Reaching for the wrong one should require
 * importing from the wrong file rather than picking the wrong sibling function.
 */

/** Abandon before dispatch — deferred by the budget guard, or the run was cancelled. */
export function releaseReservation(reservation: Reservation, now?: Date): Reservation {
    assertReservationOpen(reservation, "release");
    return {
        ...reservation,
        state: "released",
        settledAt: (now ?? new Date()).toISOString(),
        settledUnits: 0,
        overrunUnits: 0,
        billableUnits: 0,
        costMicroUsd: 0,
    };
}

/** Default TTL after which an unsettled reservation is assumed to be a crashed run. */
export const RESERVATION_TTL_MS = 30 * 60 * 1000;

export function isExpired(reservation: Reservation, now: Date, ttlMs = RESERVATION_TTL_MS): boolean {
    if (reservation.state !== "reserved") return false;
    return now.getTime() - Date.parse(reservation.reservedAt) > ttlMs;
}

/**
 * Sweep a crashed reservation so its units return to the day's allowance.
 *
 * Zeroing consumption here is a claim that nothing was spent, and a dispatched
 * reservation cannot honestly make it — `dispatch_attempts > 0` means a request
 * went out and may have been billed. Expiring such a row silently converts a
 * possible charge into recorded-zero, which is the undercount the ledger exists
 * to prevent. Callers must reconcile those against the vendor instead; this
 * function is for reservations that never reached an engine.
 */
export function expireReservation(reservation: Reservation, now?: Date): Reservation {
    assertReservationOpen(reservation, "expire");
    return {
        ...reservation,
        state: "expired",
        settledAt: (now ?? new Date()).toISOString(),
        settledUnits: 0,
        overrunUnits: 0,
        billableUnits: 0,
        costMicroUsd: 0,
    };
}
