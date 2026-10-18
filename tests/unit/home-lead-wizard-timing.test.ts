import { describe, expect, it } from "vitest";
import { hasCampaignParams, hasReachedScrollDepth } from "@/components/marketing/use-home-lead-wizard-timing";

describe("home lead wizard campaign guard", () => {
    it.each(["?utm_source=google", "?UTM_campaign=spring", "?gclid=abc", "?fbclid=xyz", "?ref=1&utm_medium=cpc"])(
        "skips the popup for %s",
        (search) => {
            expect(hasCampaignParams(search)).toBe(true);
        },
    );

    it.each(["", "?ref=partner", "?qa=wizard", "?utm=1"])("allows the popup for %s", (search) => {
        expect(hasCampaignParams(search)).toBe(false);
    });
});

describe("home lead wizard scroll depth", () => {
    it("waits until 60% of the scrollable distance", () => {
        expect(hasReachedScrollDepth(0, 800, 4800)).toBe(false);
        expect(hasReachedScrollDepth(2300, 800, 4800)).toBe(false);
        expect(hasReachedScrollDepth(2400, 800, 4800)).toBe(true);
    });

    it("never fires on a page that cannot scroll", () => {
        expect(hasReachedScrollDepth(0, 900, 900)).toBe(false);
        expect(hasReachedScrollDepth(0, 900, 600)).toBe(false);
    });
});
