import { describe, expect, it } from "vitest";

import { assignCrawlSlot, isCrawlDueNow } from "../../src/services/aeo/crawler/crawl-slot";
import { assignSlot } from "../../src/services/aeo/scheduler/sampling-slot";

const BUSINESS_ID = "9fa5eb9e-a7cb-4d6f-bd2c-0308703cf0c7";

/** 2026-08-02 is a known Sunday (UTC day 0); walking forward avoids hand-counting weekdays. */
function utcAt(dayOfWeek: number, hour: number): Date {
    return new Date(Date.UTC(2026, 7, 2 + dayOfWeek, hour, 0, 0));
}

describe("assignCrawlSlot", () => {
    it("is independently salted from the AEO sampling slot", () => {
        // Not a hard guarantee for every id (a coincidental collision is
        // possible), but the two must be DERIVED differently, not aliases of
        // the same hash. Checked across a spread of ids.
        const ids = Array.from({ length: 50 }, (_, i) => `biz-${i}`);
        const anyDiffer = ids.some((id) => {
            const sampling = assignSlot(id);
            const crawl = assignCrawlSlot(id);
            return sampling.dayOfWeek !== crawl.dayOfWeek || sampling.hour !== crawl.hour;
        });
        expect(anyDiffer).toBe(true);
    });

    it("is stable for the same business id", () => {
        expect(assignCrawlSlot(BUSINESS_ID)).toEqual(assignCrawlSlot(BUSINESS_ID));
    });
});

describe("isCrawlDueNow", () => {
    it("is due exactly on its assigned (day, hour), not before", () => {
        const slot = assignCrawlSlot(BUSINESS_ID);
        const justBefore =
            slot.hour > 0
                ? utcAt(slot.dayOfWeek, slot.hour - 1)
                : utcAt((slot.dayOfWeek + 6) % 7, 23);
        expect(isCrawlDueNow(BUSINESS_ID, justBefore)).toBe(false);
    });

    it("is due exactly on its assigned (day, hour)", () => {
        const slot = assignCrawlSlot(BUSINESS_ID);
        expect(isCrawlDueNow(BUSINESS_ID, utcAt(slot.dayOfWeek, slot.hour))).toBe(true);
    });

    it("is not due on the right hour but the wrong day", () => {
        const slot = assignCrawlSlot(BUSINESS_ID);
        const otherDay = (slot.dayOfWeek + 3) % 7;
        expect(isCrawlDueNow(BUSINESS_ID, utcAt(otherDay, slot.hour))).toBe(false);
    });
});
