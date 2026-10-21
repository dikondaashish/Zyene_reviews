import { describe, expect, it } from "vitest";
import { nextAllowedSendTime, resolveTimezone, zonedTimeToUtc } from "@/lib/review-requests/quiet-hours";

const ny = { enabled: true, start: "21:00", end: "08:00", timezone: "America/New_York" };

describe("review request quiet hours", () => {
    it("allows sends outside the window and when disabled", () => {
        expect(nextAllowedSendTime(new Date("2026-06-15T16:00:00Z"), ny)).toBeNull(); // 12:00 EDT
        expect(nextAllowedSendTime(new Date("2026-06-16T03:00:00Z"), { ...ny, enabled: false })).toBeNull();
        expect(nextAllowedSendTime(new Date("2026-06-16T03:00:00Z"), { ...ny, start: "09:00", end: "09:00" })).toBeNull();
    });

    it("defers late-evening sends to 08:00 local the next morning", () => {
        // 23:00 EDT on Jun 15 -> 08:00 EDT on Jun 16 (12:00 UTC)
        expect(nextAllowedSendTime(new Date("2026-06-16T03:00:00Z"), ny)?.toISOString()).toBe("2026-06-16T12:00:00.000Z");
    });

    it("defers early-morning sends to 08:00 the same local day", () => {
        // 06:30 EDT -> 08:00 EDT
        expect(nextAllowedSendTime(new Date("2026-06-16T10:30:00Z"), ny)?.toISOString()).toBe("2026-06-16T12:00:00.000Z");
    });

    it("tracks daylight-saving changes (EST vs EDT)", () => {
        // Nov 1 2026 is the fall-back day in the US: 08:00 EST = 13:00 UTC.
        expect(nextAllowedSendTime(new Date("2026-11-01T06:00:00Z"), ny)?.toISOString()).toBe("2026-11-01T13:00:00.000Z");
        // Mar 8 2026 spring-forward: 08:00 EDT = 12:00 UTC.
        expect(nextAllowedSendTime(new Date("2026-03-08T06:00:00Z"), ny)?.toISOString()).toBe("2026-03-08T12:00:00.000Z");
    });

    it("supports same-day windows and non-US zones", () => {
        const lunch = { enabled: true, start: "12:00", end: "13:30", timezone: "Asia/Kolkata" };
        // 12:15 IST -> 13:30 IST (08:00 UTC)
        expect(nextAllowedSendTime(new Date("2026-06-16T06:45:00Z"), lunch)?.toISOString()).toBe("2026-06-16T08:00:00.000Z");
    });

    it("falls back to UTC for unknown timezones and resolves DST-gap times forward", () => {
        expect(resolveTimezone("Not/AZone")).toBe("UTC");
        // 02:30 does not exist in New York on Mar 8 2026; resolves to a real instant after the gap.
        const gap = zonedTimeToUtc({ year: 2026, month: 3, day: 8, hour: 2, minute: 30 }, "America/New_York");
        expect(gap.getTime()).toBeGreaterThanOrEqual(Date.parse("2026-03-08T07:00:00Z"));
    });
});
