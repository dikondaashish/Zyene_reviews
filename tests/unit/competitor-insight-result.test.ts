import { describe, expect, it } from "vitest";
import {
  parseCompetitorInsightPayload,
  normalizeInsightPriority,
} from "../../src/lib/competitors/competitor-insight-result";

describe("competitor-insight-result", () => {
  it("parses valid payload", () => {
    const out = parseCompetitorInsightPayload({
      summary: "Competitor gained reviews.",
      priority: "high",
      confidence: 0.8,
      why_it_matters: "Trust signal",
      owner_suggestion: "manager",
      actions: [],
      recommendations: ["A", "B"],
    });
    expect(out.summary).toBe("Competitor gained reviews.");
    expect(out.priority).toBe("high");
    expect(out.confidence).toBe(0.8);
    expect(out.ownerSuggestion).toBe("manager");
    expect(out.recommendations).toEqual(["A", "B"]);
  });

  it("throws on missing summary", () => {
    expect(() => parseCompetitorInsightPayload({ priority: "low" })).toThrow(/Missing summary/);
  });

  it("throws on non-object", () => {
    expect(() => parseCompetitorInsightPayload(null)).toThrow(/expected object/);
    expect(() => parseCompetitorInsightPayload("x")).toThrow(/expected object/);
  });

  it("fills defaults for partial fields", () => {
    const out = parseCompetitorInsightPayload({
      summary: "x",
      confidence: NaN,
    });
    expect(out.confidence).toBe(0.5);
    expect(out.whyItMatters.length).toBeGreaterThan(0);
  });

  it("normalizeInsightPriority maps unknown to low", () => {
    expect(normalizeInsightPriority("")).toBe("low");
    expect(normalizeInsightPriority("HIGH")).toBe("high");
  });
});
