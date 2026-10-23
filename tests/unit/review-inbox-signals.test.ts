import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isUrgentReview, replyWaitLabel } from "@/lib/reviews/inbox-signals";

vi.mock("@/components/reviews/review-card", () => ({ ReviewCard: () => null }));
const { CompactReviewRow } = await import("@/components/reviews/compact-review-row");

const NOW = new Date("2026-10-22T12:00:00Z");
const daysAgo = (d: number, hours = 0) => new Date(NOW.getTime() - d * 86_400_000 - hours * 3_600_000).toISOString();

describe("isUrgentReview", () => {
    it.each([
        [{ rating: 1 }, true],
        [{ rating: 2 }, true],
        [{ rating: 3 }, false],
        [{ rating: 5, urgency_score: 7 }, true],
        [{ rating: 5, urgency_score: 6 }, false],
        [{ rating: 0 }, false],
        [{ rating: "1" }, false],
        [{}, false],
    ])("pending %o → %s", (review, expected) => {
        expect(isUrgentReview({ ...review, response_status: "pending" })).toBe(expected);
    });

    it("treats a missing status as unanswered", () => {
        expect(isUrgentReview({ rating: 1 })).toBe(true);
        expect(isUrgentReview({ rating: 1, response_status: null })).toBe(true);
    });

    it("drops the flag once the review is answered or ignored", () => {
        expect(isUrgentReview({ rating: 1, urgency_score: 10, response_status: "responded" })).toBe(false);
        expect(isUrgentReview({ rating: 1, response_status: "ignored" })).toBe(false);
    });
});

describe("replyWaitLabel", () => {
    it.each([
        [daysAgo(0, 5), null],
        [daysAgo(1), "Waiting 1 day"],
        [daysAgo(1, 23), "Waiting 1 day"],
        [daysAgo(3), "Waiting 3 days"],
        [daysAgo(30), "Waiting 30 days"],
        [daysAgo(31), null],
        [daysAgo(-2), null],
        ["not a date", null],
        [null, null],
    ])("%s → %s", (date, expected) => {
        expect(replyWaitLabel(date, "pending", NOW)).toBe(expected);
    });

    it("says nothing once the review is answered", () => {
        expect(replyWaitLabel(daysAgo(3), "responded", NOW)).toBeNull();
        expect(replyWaitLabel(daysAgo(3), "ignored", NOW)).toBeNull();
    });
});

describe("review row signals", () => {
    beforeEach(() => vi.useFakeTimers({ now: NOW, toFake: ["Date"] }));
    afterEach(() => vi.useRealTimers());

    const row = (review: Record<string, unknown>) =>
        renderToStaticMarkup(createElement(CompactReviewRow, {
            review: { id: "r1", author_name: "Sam", platform: "google", text: "Text", ...review } as never,
            googleMapsListingUrl: null, planAllowsAiReplies: true, isSelected: false, onSelect: () => {},
            open: false, onOpenChange: () => {},
        }));

    it("flags an unanswered 1-star review as urgent and shows how long it waited", () => {
        const html = row({ rating: 1, response_status: "pending", review_date: daysAgo(4) });
        expect(html).toContain("Urgent");
        expect(html).toContain("Waiting 4 days");
        expect(html).toContain("Needs reply");
    });

    it("shows only the wait for a happy unanswered review", () => {
        const html = row({ rating: 5, response_status: "pending", review_date: daysAgo(2) });
        expect(html).not.toContain("Urgent");
        expect(html).toContain("Waiting 2 days");
    });

    it("shows neither once the owner has replied", () => {
        const html = row({ rating: 1, urgency_score: 9, response_status: "responded", review_date: daysAgo(4) });
        expect(html).not.toContain("Urgent");
        expect(html).not.toContain("Waiting");
    });
});
