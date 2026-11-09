import { describe, expect, it } from "vitest";

import {
    cycleResetAtAfterReset,
    isDueForMonthlyReset,
} from "../../src/services/aeo/billing/yearly-credit-reset-eligibility";

const utc = (iso: string) => new Date(iso);
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Runs the daily cron for `days` days after checkout: each day the cron asks
 * isDueForMonthlyReset, and a due org gets the reset, whose new cycle_reset_at
 * follows aeo_reset_credit_grant's rule (cycleResetAtAfterReset). Returns the
 * UTC dates the resets landed on.
 */
function simulateDailyCron(checkoutIso: string, days: number): string[] {
    let cycleResetAt = utc(checkoutIso);
    const resets: string[] = [];
    for (let i = 1; i <= days; i++) {
        // The cron runs at 06:00 UTC each day.
        const today = new Date(cycleResetAtStartOfDay(checkoutIso) + i * DAY_MS + 6 * 60 * 60 * 1000);
        if (isDueForMonthlyReset(cycleResetAt, today)) {
            resets.push(today.toISOString().slice(0, 10));
            cycleResetAt = cycleResetAtAfterReset(cycleResetAt, today);
        }
    }
    return resets;
}

function cycleResetAtStartOfDay(iso: string): number {
    const d = utc(iso);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

describe("yearly credit anchor - a 31st anchor survives short months", () => {
    it("fires on the last day of Feb, Apr, Jun, Sep, Nov and back on the 31st otherwise", () => {
        expect(simulateDailyCron("2026-01-31T09:00:00Z", 365)).toEqual([
            "2026-02-28",
            "2026-03-31",
            "2026-04-30",
            "2026-05-31",
            "2026-06-30",
            "2026-07-31",
            "2026-08-31",
            "2026-09-30",
            "2026-10-31",
            "2026-11-30",
            "2026-12-31",
            "2027-01-31",
        ]);
    });

    it("uses Feb 29 in a leap year and returns to the 31st in March", () => {
        expect(simulateDailyCron("2028-01-31T09:00:00Z", 70)).toEqual(["2028-02-29", "2028-03-31"]);
    });

    it("keeps a 30th anchor through February in leap and non-leap years", () => {
        expect(simulateDailyCron("2026-01-30T09:00:00Z", 70)).toEqual(["2026-02-28", "2026-03-30"]);
        expect(simulateDailyCron("2028-01-30T09:00:00Z", 70)).toEqual(["2028-02-29", "2028-03-30"]);
    });

    it("keeps a 29th anchor through a non-leap February, and a leap February has the 29th itself", () => {
        expect(simulateDailyCron("2026-01-29T09:00:00Z", 70)).toEqual(["2026-02-28", "2026-03-29"]);
        expect(simulateDailyCron("2028-01-29T09:00:00Z", 70)).toEqual(["2028-02-29", "2028-03-29"]);
    });

    it("leaves an ordinary 15th anchor on the 15th every month", () => {
        expect(simulateDailyCron("2026-01-15T09:00:00Z", 120)).toEqual([
            "2026-02-15",
            "2026-03-15",
            "2026-04-15",
            "2026-05-15",
        ]);
    });
});

describe("cycleResetAtAfterReset - mirrors aeo_reset_credit_grant", () => {
    it("re-anchors a brand-new balance row to the reset time", () => {
        const resetAt = utc("2026-02-28T06:00:00Z");
        expect(cycleResetAtAfterReset(null, resetAt)).toEqual(resetAt);
    });

    it("keeps a 31st anchor on Feb 28 and Apr 30 (short-month stand-ins)", () => {
        const jan31 = utc("2026-01-31T09:00:00Z");
        expect(cycleResetAtAfterReset(jan31, utc("2026-02-28T06:00:00Z"))).toEqual(jan31);
        const mar31 = utc("2026-03-31T06:00:00Z");
        expect(cycleResetAtAfterReset(mar31, utc("2026-04-30T06:00:00Z"))).toEqual(mar31);
    });

    it("moves to the reset time on a full occurrence of the anchor day", () => {
        const mar31 = utc("2026-03-31T06:00:00Z");
        expect(cycleResetAtAfterReset(utc("2026-01-31T09:00:00Z"), mar31)).toEqual(mar31);
    });

    it("re-anchors a reset on a day that is not a month's last day (checkout, plan change)", () => {
        const feb20 = utc("2026-02-20T12:00:00Z");
        expect(cycleResetAtAfterReset(utc("2026-01-31T09:00:00Z"), feb20)).toEqual(feb20);
    });

    it("re-anchors a month-end reset when the old anchor day is not later than it", () => {
        // A 28th anchor reset on Feb 28 is a full occurrence, not a stand-in.
        const feb28 = utc("2026-02-28T06:00:00Z");
        expect(cycleResetAtAfterReset(utc("2026-01-28T09:00:00Z"), feb28)).toEqual(feb28);
    });

    it("re-anchors a same-month reset rather than keeping a stale anchor", () => {
        // Defensive: the SQL same-day guard no-ops these, but a later day in
        // the same month is never a stand-in for that month's own anchor.
        const apr30 = utc("2026-04-30T06:00:00Z");
        expect(cycleResetAtAfterReset(utc("2026-04-01T09:00:00Z"), apr30)).toEqual(apr30);
    });

    it("re-anchors a row created by a top-up (cycle_reset_at = epoch)", () => {
        const resetAt = utc("2026-04-30T06:00:00Z");
        expect(cycleResetAtAfterReset(new Date(0), resetAt)).toEqual(resetAt);
    });
});
