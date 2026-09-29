import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AnalyticsPageStatsRow } from "@/components/analytics/analytics-page-stats-row";
import { AnalyticsPageGoogleKeywordsDiscovery } from "@/components/analytics/analytics-page-google-keywords-discovery";
import { ThemeChart } from "@/components/analytics/theme-chart";
import type { AnalyticsFullRangePayload } from "@/lib/analytics/build-analytics-range-payload";

const empty = {
    stats: { totalReviews: 0, avgRating: 0, responseRate: 0, respondedCount: 0, requestsCount: 0,
        reviewsDelta: -100, ratingDelta: -100, responseRateDelta: -100, requestsDelta: 0 },
    discoverySplit: { discoveryPct: 0, directPct: 0 },
} as AnalyticsFullRangePayload;

describe("analytics presentation edge cases", () => {
    it("does not claim rating and response declines when the current period has no reviews", () => {
        const html = renderToStaticMarkup(createElement(AnalyticsPageStatsRow, { d: empty, isDemo: false }));
        expect(html.match(/aria-label="-100.0% vs last period"/g)).toHaveLength(1);
        expect(html).toContain("—");
    });
    it("shows unavailable discovery estimates when there are no keyword impressions", () => {
        const html = renderToStaticMarkup(createElement(AnalyticsPageGoogleKeywordsDiscovery, { d: empty, searchKeywords: [] }));
        expect(html).toContain("Not enough keyword data to estimate discovery yet.");
        expect(html).not.toContain("0%");
    });
    it("keeps comparisons when review data is available", () => {
        const d = { ...empty, stats: { ...empty.stats, totalReviews: 4, avgRating: 4, responseRate: 75, ratingDelta: -10, responseRateDelta: 25 } };
        const html = renderToStaticMarkup(createElement(AnalyticsPageStatsRow, { d, isDemo: false }));
        expect(html).toContain('aria-label="-10.0% vs last period"');
        expect(html).toContain('aria-label="+25.0% vs last period"');
    });
    it("distinguishes repeated keyword rows by month", () => {
        const searchKeywords = [
            { keyword: "restaurants", impressions: 20, monthStart: "2026-09-01" },
            { keyword: "restaurants", impressions: 10, monthStart: "2026-08-01" },
        ];
        const html = renderToStaticMarkup(createElement(AnalyticsPageGoogleKeywordsDiscovery, { d: empty, searchKeywords }));
        expect(html).toContain("Sep 2026");
        expect(html).toContain("Aug 2026");
    });
    it("treats a small net theme score as balanced", () => {
        const html = renderToStaticMarkup(createElement(ThemeChart, { data: [{ theme: "Service", count: 84, sentimentScore: 1 }] }));
        expect(html).toContain("Balanced");
        expect(html).not.toContain("Positive leaning");
    });
});
