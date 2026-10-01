import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/redis", () => ({ redis: {} }));
import { widgetSummaryInput, widgetSummaryKey } from "@/lib/widgets/summary-cache";
import type { PublicWidgetReview } from "@/lib/widgets/public-types";
const reviews: PublicWidgetReview[] = [
    { id: "a", author_name: "A", platform: "google", rating: 5, content: "Great", created_at: "2026-09-01" },
    { id: "b", author_name: "B", platform: "yelp", rating: 2, content: "Slow", created_at: "2026-09-01" },
    { id: "c", author_name: "C", platform: "google", rating: 4, content: "", created_at: "2026-09-01" },
];
describe("public widget summary publication", () => {
    it("includes only written reviews from the selected source", () => {
        expect(widgetSummaryInput(reviews, "google").map(r => r.id)).toEqual(["a"]);
        expect(widgetSummaryInput(reviews, "all").map(r => r.id)).toEqual(["a", "b"]);
    });
    it("invalidates summaries when reviews are hidden, edited, rated differently, or assigned to another business", () => {
        const key = widgetSummaryKey("one", reviews, "all");
        expect(widgetSummaryKey("one", reviews.slice(1), "all")).not.toBe(key);
        expect(widgetSummaryKey("one", [{ ...reviews[0], content: "Different" }, ...reviews.slice(1)], "all")).not.toBe(key);
        expect(widgetSummaryKey("one", [{ ...reviews[0], rating: 1 }, ...reviews.slice(1)], "all")).not.toBe(key);
        expect(widgetSummaryKey("two", reviews, "all")).not.toBe(key);
        expect(widgetSummaryKey("one", reviews, "google")).not.toBe(key);
    });
});
