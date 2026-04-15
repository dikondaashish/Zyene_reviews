import { describe, expect, it } from "vitest";
import { computeCompetitorMovementRows } from "../../src/lib/competitors/snapshot-movement";

describe("snapshot-movement", () => {
  it("returns null deltas when no snapshots", () => {
    const rows = computeCompetitorMovementRows([{ id: "a", name: "A" }], []);
    expect(rows).toEqual([
      {
        competitorId: "a",
        name: "A",
        ratingDelta: null,
        reviewsDelta: null,
        hasBaseline: false,
      },
    ]);
  });

  it("single snapshot: zero deltas, no baseline", () => {
    const rows = computeCompetitorMovementRows(
      [{ id: "a", name: "A" }],
      [
        {
          competitor_id: "a",
          captured_at: "2026-01-10T00:00:00.000Z",
          average_rating: 4.5,
          total_reviews: 10,
        },
      ]
    );
    expect(rows[0].ratingDelta).toBe(0);
    expect(rows[0].reviewsDelta).toBe(0);
    expect(rows[0].hasBaseline).toBe(false);
  });

  it("two snapshots: deltas and baseline", () => {
    const rows = computeCompetitorMovementRows(
      [{ id: "a", name: "A" }],
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
          average_rating: 4.4,
          total_reviews: 12,
        },
      ]
    );
    expect(rows[0].ratingDelta).toBeCloseTo(0.4);
    expect(rows[0].reviewsDelta).toBe(4);
    expect(rows[0].hasBaseline).toBe(true);
  });

  it("sorts snapshots by captured_at", () => {
    const rows = computeCompetitorMovementRows(
      [{ id: "a", name: "A" }],
      [
        {
          competitor_id: "a",
          captured_at: "2026-01-10T00:00:00.000Z",
          average_rating: 5,
          total_reviews: 20,
        },
        {
          competitor_id: "a",
          captured_at: "2026-01-01T00:00:00.000Z",
          average_rating: 4,
          total_reviews: 10,
        },
      ]
    );
    expect(rows[0].ratingDelta).toBe(1);
    expect(rows[0].reviewsDelta).toBe(10);
  });
});
