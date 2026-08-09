import { describe, expect, it } from "vitest";

import { isBusinessDueNow } from "../../src/services/aeo/scheduler/is-business-due-now";
import { assignSlot } from "../../src/services/aeo/scheduler/sampling-slot";

const BUSINESS_ID = "9fa5eb9e-a7cb-4d6f-bd2c-0308703cf0c7";

/** 2026-08-02 is a known Sunday (UTC day 0); walking forward avoids hand-counting weekdays. */
function utcAt(dayOfWeek: number, hour: number): Date {
    return new Date(Date.UTC(2026, 7, 2 + dayOfWeek, hour, 0, 0));
}

describe("isBusinessDueNow", () => {
    it("is due exactly on its assigned (day, hour), not before", () => {
        const slot = assignSlot(BUSINESS_ID);
        const justBefore =
            slot.hour > 0
                ? utcAt(slot.dayOfWeek, slot.hour - 1)
                : utcAt((slot.dayOfWeek + 6) % 7, 23);
        expect(isBusinessDueNow(BUSINESS_ID, justBefore)).toBe(false);
    });

    it("is due exactly on its assigned (day, hour)", () => {
        const slot = assignSlot(BUSINESS_ID);
        expect(isBusinessDueNow(BUSINESS_ID, utcAt(slot.dayOfWeek, slot.hour))).toBe(true);
    });

    it("is not due on the right hour but the wrong day", () => {
        const slot = assignSlot(BUSINESS_ID);
        const otherDay = (slot.dayOfWeek + 3) % 7;
        expect(isBusinessDueNow(BUSINESS_ID, utcAt(otherDay, slot.hour))).toBe(false);
    });

    it("is not due on the right day but the wrong hour", () => {
        const slot = assignSlot(BUSINESS_ID);
        const otherHour = (slot.hour + 1) % 24;
        // Guard against the 1-in-24 chance the wrap lands back on the real slot.
        if (otherHour === slot.hour) return;
        expect(isBusinessDueNow(BUSINESS_ID, utcAt(slot.dayOfWeek, otherHour))).toBe(false);
    });

    it("two different businesses are not due at the same time unless their slots genuinely collide", () => {
        const other = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
        const slotA = assignSlot(BUSINESS_ID);
        const slotB = assignSlot(other);
        const bothDue =
            slotA.dayOfWeek === slotB.dayOfWeek && slotA.hour === slotB.hour;
        const now = utcAt(slotA.dayOfWeek, slotA.hour);
        expect(isBusinessDueNow(BUSINESS_ID, now)).toBe(true);
        expect(isBusinessDueNow(other, now)).toBe(bothDue);
    });
});
