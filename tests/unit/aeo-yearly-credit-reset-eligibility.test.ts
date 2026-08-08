import { describe, expect, it } from "vitest";

import { isDueForMonthlyReset } from "../../src/services/aeo/billing/yearly-credit-reset-eligibility";

function utc(iso: string): Date {
    return new Date(iso);
}

describe("isDueForMonthlyReset — the ordinary case", () => {
    it("is due when today's day-of-month matches the anchor", () => {
        expect(isDueForMonthlyReset(utc("2026-01-15T09:00:00Z"), utc("2026-02-15T00:00:00Z"))).toBe(true);
    });

    it("is not due on any other day", () => {
        expect(isDueForMonthlyReset(utc("2026-01-15T09:00:00Z"), utc("2026-02-14T00:00:00Z"))).toBe(false);
        expect(isDueForMonthlyReset(utc("2026-01-15T09:00:00Z"), utc("2026-02-16T00:00:00Z"))).toBe(false);
    });

    it("does not care how many months have passed, only the day-of-month", () => {
        expect(isDueForMonthlyReset(utc("2026-01-15T09:00:00Z"), utc("2026-08-15T00:00:00Z"))).toBe(true);
    });
});

describe("isDueForMonthlyReset — never due the day it was just reset", () => {
    it("is false on the checkout day itself, even though the day-of-month trivially matches", () => {
        expect(isDueForMonthlyReset(utc("2026-02-15T09:00:00Z"), utc("2026-02-15T14:00:00Z"))).toBe(false);
    });

    it("is false immediately after any reset landed today, regardless of time-of-day drift", () => {
        expect(isDueForMonthlyReset(utc("2026-02-15T23:59:00Z"), utc("2026-02-15T00:01:00Z"))).toBe(false);
    });
});

describe("isDueForMonthlyReset — anchor day does not exist in the current month", () => {
    it("fires on Feb 28 for a 31st anchor in a non-leap year", () => {
        expect(isDueForMonthlyReset(utc("2026-01-31T09:00:00Z"), utc("2026-02-28T00:00:00Z"))).toBe(true);
    });

    it("does not ALSO fire on Mar 1 for the same 31st anchor", () => {
        // Only one reset per month — the normalized day, not an open window.
        expect(isDueForMonthlyReset(utc("2026-01-31T09:00:00Z"), utc("2026-03-01T00:00:00Z"))).toBe(false);
    });

    it("fires on Feb 29 for a 31st anchor in a leap year", () => {
        expect(isDueForMonthlyReset(utc("2028-01-31T09:00:00Z"), utc("2028-02-29T00:00:00Z"))).toBe(true);
    });

    it("prefers the exact match over normalization once the month is long enough again", () => {
        // A 31st anchor normalized to Feb 28 must not keep firing on the 28th
        // of every later month once that month actually has a 31st.
        expect(isDueForMonthlyReset(utc("2026-01-31T09:00:00Z"), utc("2026-03-28T00:00:00Z"))).toBe(false);
        expect(isDueForMonthlyReset(utc("2026-01-31T09:00:00Z"), utc("2026-03-31T00:00:00Z"))).toBe(true);
    });

    it("normalizes a 30th anchor for February in both leap and non-leap years", () => {
        expect(isDueForMonthlyReset(utc("2026-01-30T09:00:00Z"), utc("2026-02-28T00:00:00Z"))).toBe(true);
        expect(isDueForMonthlyReset(utc("2028-01-30T09:00:00Z"), utc("2028-02-29T00:00:00Z"))).toBe(true);
    });

    it("does not normalize a 30th anchor in a 31-day month — the exact day exists, so it is used", () => {
        expect(isDueForMonthlyReset(utc("2026-01-30T09:00:00Z"), utc("2026-03-30T00:00:00Z"))).toBe(true);
        expect(isDueForMonthlyReset(utc("2026-01-30T09:00:00Z"), utc("2026-03-31T00:00:00Z"))).toBe(false);
    });
});

describe("isDueForMonthlyReset — UTC boundary, not local time", () => {
    it("reads the anchor day in UTC even when the timestamp is late in a UTC day", () => {
        // 23:30 UTC on the 15th is still the 15th in UTC, whatever the local
        // wall-clock date happened to be wherever the row was written.
        expect(isDueForMonthlyReset(utc("2026-01-15T23:30:00Z"), utc("2026-02-15T00:00:00Z"))).toBe(true);
    });
});
