import { describe, expect, it } from "vitest";
import { DRIP_STALE_AFTER_HOURS, DRIP_STEP_DELAY_HOURS, isStaleReminder } from "@/lib/campaigns/drip-phase1";

const NOW = new Date("2026-11-08T12:00:00Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString();

describe("isStaleReminder", () => {
    it("sends pending reminders after the gap is shortened from 7 days to 1 day", () => {
        // First message 5 days ago; with a 1-day gap the reminder is "4 days late", but
        // the owner just shortened it and the settings promise it applies to pending ones.
        expect(isStaleReminder(hoursAgo(5 * 24), 24, NOW)).toBe(false);
    });

    it("still expires reminders after a long pause", () => {
        expect(isStaleReminder(hoursAgo(DRIP_STEP_DELAY_HOURS + DRIP_STALE_AFTER_HOURS + 1), 24, NOW)).toBe(true);
    });

    it("measures long custom gaps from their own due time", () => {
        const thirtyDays = 30 * 24;
        expect(isStaleReminder(hoursAgo(thirtyDays + 10), thirtyDays, NOW)).toBe(false);
        expect(isStaleReminder(hoursAgo(thirtyDays + DRIP_STALE_AFTER_HOURS + 1), thirtyDays, NOW)).toBe(true);
    });

    it("treats a missing previous send as stale", () => {
        expect(isStaleReminder(null, 24, NOW)).toBe(true);
    });
});
