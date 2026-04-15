import { describe, expect, it } from "vitest";
import {
  averageRatingFromReviewRatings,
  firstLastSnapshotsByCompetitor,
  isCompetitorAlertEventType,
  marketAverageEndRating,
} from "../../src/lib/competitors/range-benchmark";

describe("range-benchmark", () => {
  it("firstLastSnapshotsByCompetitor sorts by captured_at", () => {
    const map = firstLastSnapshotsByCompetitor([
      {
        competitor_id: "a",
        captured_at: "2026-01-10T00:00:00.000Z",
        average_rating: 4.5,
        total_reviews: 10,
      },
      {
        competitor_id: "a",
        captured_at: "2026-01-01T00:00:00.000Z",
        average_rating: 4.0,
        total_reviews: 8,
      },
    ]);
    const pair = map.get("a");
    expect(pair?.first.average_rating).toBe(4);
    expect(pair?.last.average_rating).toBe(4.5);
  });

  it("marketAverageEndRating uses last snapshot per competitor", () => {
    const { avgEnd, usedFallback } = marketAverageEndRating(
      [{ id: "a", average_rating: 4.5, total_reviews: 10 }],
      [
        {
          competitor_id: "a",
          captured_at: "2026-01-01T00:00:00.000Z",
          average_rating: 4,
          total_reviews: 8,
        },
        {
          competitor_id: "a",
          captured_at: "2026-01-10T00:00:00.000Z",
          average_rating: 4.8,
          total_reviews: 12,
        },
      ]
    );
    expect(usedFallback).toBe(false);
    expect(avgEnd).toBeCloseTo(4.8);
  });

  it("marketAverageEndRating falls back to competitor row when no snapshots", () => {
    const { avgEnd, usedFallback } = marketAverageEndRating(
      [{ id: "a", average_rating: 4.2, total_reviews: 5 }],
      []
    );
    expect(usedFallback).toBe(true);
    expect(avgEnd).toBeCloseTo(4.2);
  });

  it("averageRatingFromReviewRatings returns null for empty", () => {
    expect(averageRatingFromReviewRatings([])).toBeNull();
    expect(averageRatingFromReviewRatings([4, 5])).toBeCloseTo(4.5);
  });

  it("isCompetitorAlertEventType matches prefix", () => {
    expect(isCompetitorAlertEventType("competitor.alert.rating_surge")).toBe(true);
    expect(isCompetitorAlertEventType("competitor.snapshot")).toBe(false);
  });
});
