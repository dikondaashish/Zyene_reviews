import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { calculateReviewMetrics } from "@/lib/metrics/business-metrics";
import { isUnhappyUnanswered, NEEDS_REPLY_STATUS, needsReply, UNHAPPY_MAX_RATING } from "@/lib/reviews/unanswered-reviews";

const source = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8");

describe("unanswered review definition", () => {
    it("counts only unanswered 1–2★ reviews as unhappy", () => {
        expect(isUnhappyUnanswered({ rating: 1, response_status: "pending" })).toBe(true);
        expect(isUnhappyUnanswered({ rating: "2", response_status: "pending" })).toBe(true);
        expect(isUnhappyUnanswered({ rating: 1, response_status: "ignored" })).toBe(false);
        expect(isUnhappyUnanswered({ rating: 1, response_status: "draft_ready" })).toBe(false);
        expect(isUnhappyUnanswered({ rating: 3, response_status: "pending" })).toBe(false);
        expect(isUnhappyUnanswered({ rating: 1, response_status: "responded" })).toBe(false);
        expect(isUnhappyUnanswered({ rating: 2, response_status: "pending", responded_at: "2026-10-01" })).toBe(false);
        expect(isUnhappyUnanswered({ rating: 0, response_status: "pending" })).toBe(false);
    });

    it("keeps unhappy reviews a subset of the pending total", () => {
        const rows = [
            { rating: 5, response_status: "responded" },
            { rating: 4, response_status: "pending" },
            { rating: 2, response_status: "pending" },
            { rating: 1, response_status: "pending" },
            { rating: 1, response_status: "responded" },
            { rating: 2, response_status: "ignored" },
        ];
        const metrics = calculateReviewMetrics(rows);
        expect(rows.filter(needsReply).length).toBe(3);
        expect(rows.filter(isUnhappyUnanswered).length).toBe(2);
        // The reply rate still counts Ignored as not replied to.
        expect(metrics.responseRate).toBeCloseTo((2 / 6) * 100);
    });

    it("is the filter both dashboard queries use", () => {
        for (const file of ["src/services/dashboard/load-waiting-tasks.ts", "src/app/(dashboard)/dashboard/load-dashboard-stats-queries.ts"]) {
            const text = source(file);
            expect(text).toContain('.eq("response_status", NEEDS_REPLY_STATUS)');
            expect(text).toContain('.is("responded_at", null)');
            expect(text).toContain("UNHAPPY_MAX_RATING");
        }
        expect(UNHAPPY_MAX_RATING).toBe(2);
        // Matches the Reviews inbox Needs response tab.
        expect(NEEDS_REPLY_STATUS).toBe("pending");
        const inbox = source("src/lib/reviews/status-counts.ts");
        expect(inbox).toContain('needs_response: "pending"');
    });

    it("labels the attention list with the real total, not the rows it loaded", () => {
        const bottom = source("src/app/(dashboard)/dashboard/dashboard-view-bottom-row.tsx");
        expect(bottom).toContain("totalCount={unhappyUnansweredCount}");
        expect(bottom).toContain("attentionReviews.filter(isUnhappyUnanswered)");
        expect(source("src/lib/reviews/visible-review-rollups.ts")).toContain("unhappyPendingVisible");
    });
});
