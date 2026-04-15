import { describe, expect, it } from "vitest";
import {
  displaySentimentLabel,
  effectiveReviewAt,
} from "../../src/lib/analytics/review-timeline";

describe("review-timeline", () => {
  it("effectiveReviewAt prefers review_date over created_at", () => {
    const d = effectiveReviewAt({
      review_date: "2020-06-01T12:00:00.000Z",
      created_at: "2026-01-01T12:00:00.000Z",
    });
    expect(d.toISOString().slice(0, 10)).toBe("2020-06-01");
  });

  it("displaySentimentLabel uses AI when set", () => {
    expect(displaySentimentLabel({ sentiment: "mixed", rating: 1 })).toBe("mixed");
  });

  it("displaySentimentLabel infers from rating when sentiment missing", () => {
    expect(displaySentimentLabel({ sentiment: null, rating: 5 })).toBe("positive");
    expect(displaySentimentLabel({ sentiment: "", rating: 2 })).toBe("negative");
    expect(displaySentimentLabel({ sentiment: null, rating: 3 })).toBe("neutral");
  });
});
