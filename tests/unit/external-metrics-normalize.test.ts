import { describe, expect, it } from "vitest";
import {
  normalizeCompetitorPlacesRating,
  normalizeCompetitorPlacesReviewCount,
} from "../../src/services/competitors/external-metrics";

describe("external-metrics normalization", () => {
  it("clamps rating to 0–5 and rounds to 1 decimal", () => {
    expect(normalizeCompetitorPlacesRating(-1)).toBe(0);
    expect(normalizeCompetitorPlacesRating(6)).toBe(5);
    expect(normalizeCompetitorPlacesRating(4.26)).toBe(4.3);
    expect(normalizeCompetitorPlacesRating(NaN)).toBe(0);
  });

  it("review count is non-negative integer", () => {
    expect(normalizeCompetitorPlacesReviewCount(-3)).toBe(0);
    expect(normalizeCompetitorPlacesReviewCount(12.7)).toBe(13);
    expect(normalizeCompetitorPlacesReviewCount(NaN)).toBe(0);
  });
});
