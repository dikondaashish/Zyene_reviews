import { describe, expect, it } from "vitest";
import {
  competitorRangeLabel,
  getCompetitorRangeStart,
  normalizeCompetitorRange,
} from "../../src/lib/competitors/date-range";

describe("competitor date-range", () => {
  it("normalizeCompetitorRange defaults invalid to 30d", () => {
    expect(normalizeCompetitorRange(undefined)).toBe("30d");
    expect(normalizeCompetitorRange("foo")).toBe("30d");
    expect(normalizeCompetitorRange("7d")).toBe("7d");
  });

  it("getCompetitorRangeStart boundaries for fixed now", () => {
    const now = new Date("2026-01-15T12:00:00.000Z");
    const d7 = getCompetitorRangeStart("7d", now);
    const d30 = getCompetitorRangeStart("30d", now);
    const d90 = getCompetitorRangeStart("90d", now);
    const y12 = getCompetitorRangeStart("12m", now);

    expect(d7.toISOString()).toBe("2026-01-08T12:00:00.000Z");
    expect(d30.toISOString()).toBe("2025-12-16T12:00:00.000Z");
    expect(d90.toISOString()).toBe("2025-10-17T12:00:00.000Z");
    expect(y12.toISOString()).toBe("2025-01-15T12:00:00.000Z");
  });

  it("competitorRangeLabel matches UI copy", () => {
    expect(competitorRangeLabel("7d")).toBe("7 days");
    expect(competitorRangeLabel("12m")).toBe("12 months");
  });
});
