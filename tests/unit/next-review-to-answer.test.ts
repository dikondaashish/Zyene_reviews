import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { nextReviewToAnswer } from "@/lib/reviews/next-review-to-answer";

vi.mock("@/components/reviews/review-card", () => ({ ReviewCard: () => createElement("div", null, "full review") }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: () => {} }) }));
const { ReviewManagement } = await import("@/components/reviews/review-management");
const { openRowsAfterListChange } = await import("@/components/reviews/use-review-row-open-state");

const r = (id: string, response_status = "pending", platform = "google") => ({ id, response_status, platform });

describe("nextReviewToAnswer", () => {
    it("opens the review right below the one just answered", () => {
        expect(nextReviewToAnswer([r("a"), r("b"), r("c")], "a")).toBe("b");
        expect(nextReviewToAnswer([r("a"), r("b"), r("c")], "b")).toBe("c");
    });

    it("skips reviews that are already answered or ignored", () => {
        expect(nextReviewToAnswer([r("a"), r("b", "responded"), r("c", "ignored"), r("d")], "a")).toBe("d");
    });

    it("skips Yelp reviews, which are answered on yelp.com", () => {
        expect(nextReviewToAnswer([r("a"), r("b", "pending", "yelp"), r("c")], "a")).toBe("c");
    });

    it("wraps to the top when the answered review was the last waiting one below", () => {
        expect(nextReviewToAnswer([r("a"), r("b"), r("c")], "c")).toBe("a");
        expect(nextReviewToAnswer([r("a"), r("b", "responded"), r("c")], "c")).toBe("a");
    });

    it("never picks the review that was just answered, even while its old status is still showing", () => {
        expect(nextReviewToAnswer([r("a")], "a")).toBeNull();
        expect(nextReviewToAnswer([r("a"), r("b", "responded")], "a")).toBeNull();
    });

    it("still finds a review when the answered one already dropped out of the list", () => {
        expect(nextReviewToAnswer([r("b"), r("c")], "a")).toBe("b");
        expect(nextReviewToAnswer([], "a")).toBeNull();
    });
});

describe("review inbox list", () => {
    const html = renderToStaticMarkup(createElement(ReviewManagement, {
        reviews: [
            { id: "a", author_name: "Ann", rating: 5, platform: "google", response_status: "pending", text: "One" },
            { id: "b", author_name: "Bo", rating: 4, platform: "google", response_status: "pending", text: "Two" },
            { id: "c", author_name: "Cy", rating: 3, platform: "google", response_status: "pending", text: "Three" },
        ],
        businessId: "biz",
        planAllowsAiReplies: true,
    }));

    it("opens only the first review on load", () => {
        expect(html.match(/aria-expanded="true"/g)).toHaveLength(1);
        expect(html.match(/aria-expanded="false"/g)).toHaveLength(2);
        const firstRow = html.slice(html.indexOf('id="review-row-a"'), html.indexOf('id="review-row-b"'));
        expect(firstRow).toContain('aria-expanded="true"');
    });

    it("gives each row an anchor the inbox can scroll to", () => {
        for (const id of ["a", "b", "c"]) expect(html).toContain(`id="review-row-${id}"`);
    });
});

describe("openRowsAfterListChange", () => {
    const list = (...ids: string[]) => ids.map((id) => ({ id }));

    it("keeps the next review open when the refresh drops the answered one above it", () => {
        expect([...openRowsAfterListChange(new Set(["d"]), list("c", "d"), true)]).toEqual(["d"]);
    });

    it("opens the top review on a new page or filter, where nothing open carries over", () => {
        expect([...openRowsAfterListChange(new Set(["a"]), list("x", "y"), true)]).toEqual(["x"]);
    });

    it("leaves everything closed after the last waiting review is answered", () => {
        expect([...openRowsAfterListChange(new Set(), list("c"), false)]).toEqual([]);
    });

    it("respects an owner who closed every row when the top review didn't change", () => {
        expect([...openRowsAfterListChange(new Set(), list("a", "b"), false)]).toEqual([]);
    });

    it("handles an empty page", () => {
        expect([...openRowsAfterListChange(new Set(["a"]), [], true)]).toEqual([]);
    });
});
