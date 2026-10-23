import { describe, expect, it } from "vitest";
import { alertBaseline, computeCompetitorMovementRows } from "../../src/lib/competitors/snapshot-movement";

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

  it("single meaningful snapshot: null deltas, no baseline", () => {
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
    expect(rows[0].ratingDelta).toBeNull();
    expect(rows[0].reviewsDelta).toBeNull();
    expect(rows[0].hasBaseline).toBe(false);
  });

  it("ignores zero-value seed snapshots when computing deltas", () => {
    const rows = computeCompetitorMovementRows(
      [{ id: "a", name: "A" }],
      [
        {
          competitor_id: "a",
          captured_at: "2026-01-01T00:00:00.000Z",
          average_rating: 0,
          total_reviews: 0,
        },
        {
          competitor_id: "a",
          captured_at: "2026-01-05T00:00:00.000Z",
          average_rating: 4.2,
          total_reviews: 9702,
        },
      ]
    );
    expect(rows[0].ratingDelta).toBeNull();
    expect(rows[0].reviewsDelta).toBeNull();
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

  it("compares against the same count series when Google alternates between two totals", () => {
    const snap = (day: number, total: number, rating: number) => ({
      competitor_id: "a", captured_at: `2026-10-${String(day).padStart(2, "0")}T08:00:00.000Z`, average_rating: rating, total_reviews: total,
    });
    const rows = computeCompetitorMovementRows(
      [{ id: "a", name: "A" }],
      [snap(1, 4697, 4.1), snap(2, 4231, 4.0), snap(3, 4702, 4.1), snap(4, 4249, 4.0)]
    );
    expect(rows[0].reviewsDelta).toBe(18);
    expect(rows[0].ratingDelta).toBe(0);
    expect(rows[0].hasBaseline).toBe(true);
  });

  it("alertBaseline compares a flip back with the same series, not the latest reading", () => {
    const latest = { average_rating: 4.1, total_reviews: 4721 };
    const recent = [latest, { average_rating: 4.1, total_reviews: 4718 }, { average_rating: 4.0, total_reviews: 4243 }];
    expect(alertBaseline(latest, recent, 4249)).toEqual({ average_rating: 4.0, total_reviews: 4243 });
    expect(alertBaseline(latest, recent, 4725)).toBe(latest);
    // A genuine burst has no matching history, so it is still measured from the latest reading.
    expect(alertBaseline(latest, recent, 5300)).toBe(latest);
  });
});
