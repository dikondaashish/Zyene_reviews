/**
 * E-9.1 — is a yearly-plan org due for its monthly credit refresh today?
 *
 * Yearly subscribers get exactly one Stripe renewal event a year, so there is
 * no webhook to hang a monthly reset on. The anchor is whichever calendar day
 * the org's balance was LAST reset on — set once at checkout, then
 * self-perpetuating: every successful reset moves cycle_reset_at to today,
 * which preserves the same day-of-month for the check a month from now. No
 * new column, no Stripe API call in the daily loop.
 *
 * All dates are read in UTC, matching `cycle_reset_at::date` in
 * aeo_reset_credit_grant — a Postgres session under Supabase defaults to UTC,
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

export function isDueForMonthlyReset(cycleResetAt: Date, today: Date): boolean {
    // Never due on the exact day it was last reset — covers the checkout-day
    // grant and a reset that already landed today through any path. This is
    // TS-side belt-and-suspenders: aeo_reset_credit_grant's own same-day guard
    // is what actually protects the balance if this check is ever bypassed.
    if (isSameUTCDate(cycleResetAt, today)) return false;

    const anchorDay = cycleResetAt.getUTCDate();
    const daysThisMonth = daysInUTCMonth(today.getUTCFullYear(), today.getUTCMonth());
    // An anchor of the 31st in a 30-day month fires on that month's LAST day
    // instead of being skipped — the same normalization Stripe applies to its
    // own monthly billing_cycle_anchor edge cases. Skipping instead would cost
    // 30th/31st-anchored orgs a whole month of credit four times a year.
    const effectiveAnchorDay = Math.min(anchorDay, daysThisMonth);

    return today.getUTCDate() === effectiveAnchorDay;
}
