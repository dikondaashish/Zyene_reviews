import { describe, expect, it } from "vitest";
import { buildMonthGrid, dayKey, groupEventsByDay, resolveCalendarMonth } from "../../src/lib/automations/activity-calendar";

describe("activity calendar", () => {
    it("builds Sunday-first weeks covering the whole month", () => {
        const weeks = buildMonthGrid(2026, 10); // Oct 1 2026 is a Thursday
        expect(weeks).toHaveLength(5);
        expect(weeks[0][0]).toEqual({ key: "2026-09-27", day: 27, inMonth: false });
        expect(weeks[0][4]).toEqual({ key: "2026-10-01", day: 1, inMonth: true });
        expect(weeks.flat().filter((d) => d.inMonth)).toHaveLength(31);
    });

    it("needs six weeks when the month starts late in the week", () => {
        expect(buildMonthGrid(2026, 8)).toHaveLength(6); // Aug 1 2026 is a Saturday
    });

    it("reads ?month and falls back to the current month in the business time zone", () => {
        const now = new Date("2026-11-01T03:00:00Z"); // still Oct 31 in Chicago
        expect(resolveCalendarMonth(undefined, now, "America/Chicago").param).toBe("2026-10");
        const jan = resolveCalendarMonth("2027-01", now, "UTC");
        expect([jan.label, jan.prevParam, jan.nextParam]).toEqual(["January 2027", "2026-12", "2027-02"]);
        expect(resolveCalendarMonth("2027-13", now, "UTC").param).toBe("2026-11");
    });

    it("groups events by local day, oldest first", () => {
        const byDay = groupEventsByDay([
            { id: "b", kind: "request", at: "2026-10-23T02:00:00Z", title: "late" },
            { id: "a", kind: "review", at: "2026-10-22T15:00:00Z", title: "early" },
        ], "America/Chicago");
        expect(Object.keys(byDay)).toEqual(["2026-10-22"]);
        expect(byDay["2026-10-22"].map((e) => e.id)).toEqual(["a", "b"]);
        expect(dayKey("2026-10-23T02:00:00Z", "UTC")).toBe("2026-10-23");
    });
});
