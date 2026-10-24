import { describe, expect, it } from "vitest";
import { calculatePublicLinkMetrics, isPublicLinkVisit } from "@/lib/metrics/public-link-metrics";
import { calculateRequestMetrics } from "@/lib/metrics/business-metrics";
import { computeZyenePlatformAnalyticsBase } from "@/components/analytics/zyene-platform-analytics-compute-base";
import { computeZyenePlatformAnalyticsAggregates } from "@/components/analytics/zyene-platform-analytics-compute-aggregates";
import type { ReviewRequest } from "@/components/analytics/zyene-platform-analytics-types";

const at = "2026-10-20T12:00:00.000Z";

function row(overrides: Partial<ReviewRequest>): ReviewRequest {
    return {
        id: Math.random().toString(36).slice(2),
        status: "clicked",
        channel: "link",
        trigger_source: "public_link",
        campaign_id: null,
        created_at: at,
        sent_at: at,
        delivered_at: at,
        opened_at: at,
        clicked_at: at,
        completed_at: null,
        rating_given: null,
        tags_selected: null,
        review_left: false,
        customer_name: null,
        customer_email: null,
        customer_phone: null,
        follow_up_sent_at: null,
        ai_review_text: null,
        ...overrides,
    };
}

// Mirrors the Ninja 360 shape: link-only, opened → rated → sent to Google.
const visits = [
    row({ status: "clicked" }),
    row({ status: "clicked" }),
    row({ status: "rated_positive", rating_given: 5 }),
    row({ status: "completed", rating_given: 5, completed_at: at, tags_selected: ["⭐ Friendly"] }),
    row({ status: "completed", rating_given: 5, completed_at: at, tags_selected: ["⭐ Friendly", "🚀 Fast"] }),
    row({ status: "feedback_left", rating_given: 2 }),
];
const sentEmail = row({
    channel: "email",
    trigger_source: "manual",
    customer_email: "pat@example.com",
    status: "delivered",
    clicked_at: null,
    opened_at: null,
});

describe("calculatePublicLinkMetrics", () => {
    it("counts visits, ratings, completions and Google handoffs as shares of visits", () => {
        const metrics = calculatePublicLinkMetrics([...visits, sentEmail]);
        expect(metrics).toMatchObject({
            visits: 6,
            rated: 4,
            completed: 3,
            googleHandoff: 2,
            privateFeedback: 1,
        });
        expect(metrics.completionRate).toBe(50);
    });

    it("never counts a visit as a sent request", () => {
        expect(visits.every(isPublicLinkVisit)).toBe(true);
        expect(isPublicLinkVisit(sentEmail)).toBe(false);
        expect(calculateRequestMetrics([...visits, sentEmail]).totalSent).toBe(1);
    });

    it("returns zero rates when there are no visits", () => {
        expect(calculatePublicLinkMetrics([sentEmail])).toMatchObject({ visits: 0, completionRate: 0 });
    });
});

describe("Own Platform analytics with public link visits", () => {
    const base = computeZyenePlatformAnalyticsBase([...visits, sentEmail], []);
    const aggregates = computeZyenePlatformAnalyticsAggregates(base);

    it("keeps the sent funnel to sent requests and adds a separate link funnel", () => {
        expect(base.totalSent).toBe(1);
        expect(aggregates.linkFunnelSteps.map((s) => [s.label, s.count])).toEqual([
            ["Visits", 6],
            ["Rated", 4],
            ["Completed", 3],
            ["Google handoff", 2],
        ]);
    });

    it("puts visits in the Link channel row", () => {
        const link = aggregates.channelData.find((c) => c.channel === "Link");
        expect(link).toMatchObject({ sent: 0, visits: 6, clicked: 6, completed: 3, conversionRate: 50 });
        const email = aggregates.channelData.find((c) => c.channel === "Email");
        expect(email).toMatchObject({ sent: 1, visits: 0 });
    });

    it("adds visits to daily activity and tags from visits to popular tags", () => {
        expect(aggregates.dailyData).toEqual([
            { date: "2026-10-20", sent: 1, clicked: 0, visits: 6, completed: 3 },
        ]);
        expect(aggregates.popularTags).toEqual([
            { tag: "Friendly", count: 2 },
            { tag: "Fast", count: 1 },
        ]);
    });
});
