import { describe, expect, it } from "vitest";

import { buildGoogleSeoAeoAudits } from "../../src/app/(dashboard)/google-seo-aeo/google-seo-aeo-build-audits";
import type { GbpAuditSignals } from "../../src/services/aeo/technical-audit/gbp-audit-signals";

const NOW = new Date("2026-08-11T00:00:00Z");

const HEALTHY_SIGNALS: GbpAuditSignals = {
    photos: {
        ownerPhotoCount: 25,
        totalMediaCount: 30,
        latestOwnerPhotoAt: new Date(NOW.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        truncated: false,
    },
    posts: {
        // Two of three mention the tracked keyword, clearing the 50% bar.
        recentSummaries: [
            "Best BBQ in Kansas City",
            "Smoked brisket special",
            "Book BBQ in Kansas City catering",
        ],
        recentCount: 3,
        windowDays: 90,
    },
    location: {
        serviceItems: Array.from({ length: 6 }, (_, i) => ({
            freeFormServiceItem: { label: { displayName: `Service ${i}`, description: "Copy" } },
        })),
        serviceArea: null,
    },
};

const BASE_INPUT = {
    listingDescription: "A long description ".repeat(10),
    keywordCoverage: 4,
    reviews30dCount: 12,
    googleAvgLive: 4.8,
    googleCountLive: 300,
    replyRate: 0.9,
    responded30dCount: 11,
    perfTotals: { profileViews: 500, rawRowCount: 30 },
    topKeywords: ["bbq in kansas city"],
    now: NOW,
};

describe("buildGoogleSeoAeoAudits — F5.10 acceptance", () => {
    it("ships all 11 rows with no `pending` status left (criterion #29)", () => {
        const { audits } = buildGoogleSeoAeoAudits({ ...BASE_INPUT, gbpSignals: HEALTHY_SIGNALS });

        expect(audits).toHaveLength(11);
        expect(audits.filter((a) => a.status === "pending")).toEqual([]);
    });

    it("keeps no stand-in signal behind any scored row (criterion 29a)", () => {
        const { audits } = buildGoogleSeoAeoAudits({ ...BASE_INPUT, gbpSignals: HEALTHY_SIGNALS });

        for (const audit of audits) {
            expect(audit.label, audit.id).not.toMatch(/proxy/i);
            expect(audit.detail, audit.id).not.toMatch(/proxy|place action link/i);
        }
    });

    it("scores a fully healthy profile at 100%", () => {
        const { score, measuredCount } = buildGoogleSeoAeoAudits({
            ...BASE_INPUT,
            gbpSignals: HEALTHY_SIGNALS,
        });

        // 10 scored rows: service-area is not-applicable for this storefront.
        expect(measuredCount).toBe(10);
        expect(score).toBe(100);
    });

    it("excludes unreadable Google rows from the score instead of failing them", () => {
        const { audits, score, measuredCount } = buildGoogleSeoAeoAudits({
            ...BASE_INPUT,
            gbpSignals: { photos: null, posts: null, location: null },
        });

        // Only the five non-GBP checks remain scored; all pass here.
        expect(measuredCount).toBe(5);
        expect(score).toBe(100);
        expect(audits.filter((a) => a.status === "unavailable")).toHaveLength(6);
    });

    it("scores an unreadable profile above a genuinely empty one", () => {
        // The distinction this whole status model exists for: "Google did not
        // answer" must not be scored the same as "the business has nothing".
        const emptyProfile: GbpAuditSignals = {
            photos: { ownerPhotoCount: 0, totalMediaCount: 0, latestOwnerPhotoAt: null, truncated: false },
            posts: { recentSummaries: [], recentCount: 0, windowDays: 90 },
            location: {
                serviceItems: [],
                serviceArea: { businessType: "CUSTOMER_LOCATION_ONLY", places: { placeInfos: [] } },
            },
        };

        const empty = buildGoogleSeoAeoAudits({ ...BASE_INPUT, gbpSignals: emptyProfile });
        const outage = buildGoogleSeoAeoAudits({
            ...BASE_INPUT,
            gbpSignals: { photos: null, posts: null, location: null },
        });

        expect(empty.score).toBeLessThan(outage.score);
        // The empty profile earns real failures; the outage earns none.
        expect(empty.audits.filter((a) => a.status === "fail").length).toBeGreaterThan(0);
        expect(outage.audits.filter((a) => a.status === "fail")).toEqual([]);
    });
});
