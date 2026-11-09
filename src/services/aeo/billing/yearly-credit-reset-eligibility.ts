/**
 * E-9.1 - is a yearly-plan org due for its monthly credit refresh today?
 *
 * Yearly subscribers get exactly one Stripe renewal event a year, so there is
 * no webhook to hang a monthly reset on. The anchor is the UTC day-of-month of
 * cycle_reset_at - set at checkout, then self-perpetuating. No new column, no
 * Stripe API call in the daily loop.
 *
 * cycle_reset_at is the latest FULL occurrence of the anchor day, not simply
 * "the last reset". An ordinary reset moves it to today (same day-of-month).
 * A reset on a short month's stand-in day (a 31st anchor firing on Feb 28 or
 * Apr 30) leaves it untouched, so the anchor is still the 31st next month
 * instead of drifting to the 28th/30th forever. aeo_reset_credit_grant
 * (migration 20261108120100) enforces this; `cycleResetAtAfterReset` below is
 * the same rule in TypeScript so the round trip is unit-tested.
 *
 * All dates are read in UTC, matching the UTC dates in aeo_reset_credit_grant,
 * so this and the SQL guard agree on what "today" and "the 15th" mean.
 */

function daysInUTCMonth(year: number, monthIndex0: number): number {
    // Day 0 of the NEXT month is the last day of THIS month.
    return new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
}

function isSameUTCDate(a: Date, b: Date): boolean {
    return (
        a.getUTCFullYear() === b.getUTCFullYear() &&
        a.getUTCMonth() === b.getUTCMonth() &&
        a.getUTCDate() === b.getUTCDate()
    );
}

function isEarlierUTCMonth(a: Date, b: Date): boolean {
    return a.getUTCFullYear() * 12 + a.getUTCMonth() < b.getUTCFullYear() * 12 + b.getUTCMonth();
}

export function isDueForMonthlyReset(cycleResetAt: Date, today: Date): boolean {
    // Never due on the exact day it was last reset - covers the checkout-day
    // grant and a reset that already landed today through any path. This is
    // TS-side belt-and-suspenders: aeo_reset_credit_grant's own same-day guard
    // is what actually protects the balance if this check is ever bypassed.
    if (isSameUTCDate(cycleResetAt, today)) return false;

    const anchorDay = cycleResetAt.getUTCDate();
    const daysThisMonth = daysInUTCMonth(today.getUTCFullYear(), today.getUTCMonth());
    // An anchor of the 31st in a 30-day month fires on that month's LAST day
    // instead of being skipped - the same normalization Stripe applies to its
    // own monthly billing_cycle_anchor edge cases. Skipping instead would cost
    // 30th/31st-anchored orgs a whole month of credit four times a year.
    const effectiveAnchorDay = Math.min(anchorDay, daysThisMonth);

    return today.getUTCDate() === effectiveAnchorDay;
}

/**
 * The cycle_reset_at aeo_reset_credit_grant stores after a reset at `resetAt`
 * (null previous = no balance row yet). Keeps `previous` when this reset is a
 * short month's stand-in for its anchor day; otherwise re-anchors to `resetAt`.
 */
export function cycleResetAtAfterReset(previous: Date | null, resetAt: Date): Date {
    if (!previous) return resetAt;

    const daysThisMonth = daysInUTCMonth(resetAt.getUTCFullYear(), resetAt.getUTCMonth());
    const isShortMonthStandIn =
        isEarlierUTCMonth(previous, resetAt) &&
        resetAt.getUTCDate() === daysThisMonth &&
        previous.getUTCDate() > daysThisMonth;

    return isShortMonthStandIn ? previous : resetAt;
}
