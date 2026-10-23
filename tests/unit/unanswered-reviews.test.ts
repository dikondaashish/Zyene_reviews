import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { calculateReviewMetrics } from "@/lib/metrics/business-metrics";
import { isUnhappyUnanswered, NOT_RESPONDED_OR_FILTER, UNHAPPY_MAX_RATING } from "@/lib/reviews/unanswered-reviews";

const source = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8");

describe("unanswered review definition", () => {
    it("counts only unanswered 1–2★ reviews as unhappy", () => {
        expect(isUnhappyUnanswered({ rating: 1, response_status: "pending" })).toBe(true);
        expect(isUnhappyUnanswered({ rating: "2", response_status: null })).toBe(true);
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
            { rating: 1, response_status: null },
            { rating: 1, response_status: "responded" },
        ];
        const metrics = calculateReviewMetrics(rows);
        const unhappy = rows.filter(isUnhappyUnanswered).length;
        expect(metrics.pendingReviews).toBe(3);
        expect(unhappy).toBe(2);
        expect(metrics.responseRate).toBeCloseTo(40);
    });

    it("is the filter both dashboard queries use", () => {
        for (const file of ["src/services/dashboard/load-waiting-tasks.ts", "src/app/(dashboard)/dashboard/load-dashboard-stats-queries.ts"]) {
            const text = source(file);
            expect(text).toContain("NOT_RESPONDED_OR_FILTER");
            expect(text).toContain("UNHAPPY_MAX_RATING");
            expect(text).not.toContain('.eq("response_status", "pending")');
        }
        expect(UNHAPPY_MAX_RATING).toBe(2);
        expect(NOT_RESPONDED_OR_FILTER).toContain("response_status.is.null");
    });

    it("labels the attention list with the real total, not the rows it loaded", () => {
        expect(source("src/app/(dashboard)/dashboard/dashboard-view-bottom-row.tsx")).toContain("totalCount={unhappyUnansweredCount}");
        expect(source("src/lib/reviews/visible-review-rollups.ts")).toContain("unhappyPendingVisible");
    });
});
