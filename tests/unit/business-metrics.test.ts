import { describe, expect, it } from "vitest";
import {
    calculateRequestMetrics,
    calculateReviewMetrics,
    isCompletedRequest,
    isOutboundRequest,
} from "@/lib/metrics/business-metrics";

describe("calculateReviewMetrics", () => {
    it("uses visible review rows and rating buckets for every headline metric", () => {
        const reviews = Array.from({ length: 10 }, (_, index) => ({
            rating: index === 9 ? 3 : 5,
            response_status: index === 0 ? "pending" : "responded",
            responded_at: index === 0 ? null : "2026-08-01T00:00:00.000Z",
        }));

        expect(calculateReviewMetrics(reviews)).toEqual({
            totalReviews: 10,
            ratedReviews: 10,
            averageRating: 4.8,
            respondedReviews: 9,
            pendingReviews: 1,
            responseRate: 90,
            positiveReviews: 9,
            neutralReviews: 1,
            negativeReviews: 0,
            positiveRate: 90,
            negativeRate: 0,
        });
    });

    it("does not turn missing ratings into zero-star reviews", () => {
        const metrics = calculateReviewMetrics([
            { rating: 5, response_status: "responded", responded_at: null },
            { rating: null, response_status: "pending", responded_at: null },
        ]);

        expect(metrics.totalReviews).toBe(2);
        expect(metrics.ratedReviews).toBe(1);
        expect(metrics.averageRating).toBe(5);
        expect(metrics.positiveRate).toBe(100);
    });
});

describe("calculateRequestMetrics", () => {
    it("excludes public-link tracking rows and uses sent as every rate denominator", () => {
        const outbound = Array.from({ length: 8 }, (_, index) => ({
            status: index < 4 ? "completed" : "sent",
            channel: "email",
            customer_email: `guest${index}@example.com`,
            customer_phone: null,
            customer_name: null,
            campaign_id: null,
            sent_at: "2026-08-01T00:00:00.000Z",
            delivered_at: index === 0 ? "2026-08-01T00:01:00.000Z" : null,
            clicked_at: index < 4 ? "2026-08-01T00:02:00.000Z" : null,
            completed_at: index < 4 ? "2026-08-01T00:03:00.000Z" : null,
            review_left: index < 4,
            email_status: "sent",
            sms_status: null,
        }));
        const trackerRows = Array.from({ length: 2 }, () => ({
            status: "clicked",
            channel: "email",
            customer_email: null,
            customer_phone: null,
            customer_name: null,
            campaign_id: null,
            sent_at: null,
            delivered_at: null,
            clicked_at: "2026-08-01T00:02:00.000Z",
            completed_at: null,
            review_left: false,
            email_status: null,
            sms_status: null,
        }));

        expect(calculateRequestMetrics([...outbound, ...trackerRows])).toEqual({
            totalSent: 8,
            delivered: 4,
            clicked: 4,
            completed: 4,
            emailSent: 8,
            smsSent: 0,
            totalFailed: 0,
            deliveryRate: 50,
            clickRate: 50,
            conversionRate: 50,
        });
    });

    it("normalizes legacy terminal statuses and preserves a monotonic funnel", () => {
        const completed = {
            status: "feedback_left",
            channel: "sms",
            customer_phone: "+15555550100",
            sent_at: null,
            delivered_at: null,
            clicked_at: null,
            completed_at: null,
            review_left: false,
        };

        expect(isOutboundRequest(completed)).toBe(true);
        expect(isCompletedRequest(completed)).toBe(true);
        expect(calculateRequestMetrics([completed])).toMatchObject({
            totalSent: 1,
            delivered: 1,
            clicked: 1,
            completed: 1,
            conversionRate: 100,
        });
    });
});
