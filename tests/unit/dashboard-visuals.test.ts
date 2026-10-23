import { describe, expect, it } from "vitest";
import {
    isActNow,
    listingFunnel,
    positiveMentionPct,
    scoreTone,
    themeBarWidths,
} from "@/lib/dashboard/dashboard-visuals";

describe("dashboard visuals", () => {
    it("colours scores with the same thresholds the cards used", () => {
        expect(scoreTone(null)).toBe("none");
        expect(scoreTone(85)).toBe("good");
        expect(scoreTone(80)).toBe("good");
        expect(scoreTone(55)).toBe("ok");
        expect(scoreTone(12)).toBe("bad");
    });

    it("reads AI urgency tags", () => {
        expect(isActNow("Act now")).toBe(true);
        expect(isActNow("When you can")).toBe(false);
    });

    it("builds the Google listing funnel from real totals", () => {
        const f = listingFunnel({ profileViews: 10_000, callClicks: 400, directionRequests: 800, websiteClicks: 200 });
        expect(f.totalActions).toBe(1400);
        expect(f.actionRate).toBeCloseTo(14);
        expect(f.actions.map((a) => a.widthPct)).toEqual([50, 100, 25]);
        expect(listingFunnel({ profileViews: 0, callClicks: 0, directionRequests: 0, websiteClicks: 0 }).actionRate).toBeNull();
    });

    it("sizes theme bars against the top theme without hiding small ones", () => {
        expect(themeBarWidths([40, 20, 1])).toEqual([100, 50, 6]);
        expect(themeBarWidths([0, 0])).toEqual([6, 6]);
    });

    it("counts positive mentions honestly, with no floor", () => {
        expect(positiveMentionPct([])).toBeNull();
        expect(positiveMentionPct([{ mentions: 10, sentiment: "positive" }, { mentions: 30, sentiment: "negative" }])).toBe(25);
        expect(positiveMentionPct([{ mentions: 9, sentiment: "Positive" }, { mentions: 1, sentiment: "neutral" }])).toBe(90);
    });
});
