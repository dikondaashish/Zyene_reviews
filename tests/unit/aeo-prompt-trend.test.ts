import { describe, expect, it } from "vitest";

import {
    computePromptTrend,
    recentWeekStarts,
    type PromptSampleFact,
} from "../../src/services/aeo/reporting/prompt-trend";

describe("recentWeekStarts", () => {
    it("returns Mondays, oldest first, ending on the current week", () => {
        // 2026-08-12 is a known Wednesday.
        const now = new Date(Date.UTC(2026, 7, 12));
        const weeks = recentWeekStarts(3, now);
        expect(weeks).toEqual(["2026-07-27", "2026-08-03", "2026-08-10"]);
    });

    it("a Monday itself is its own week start", () => {
        const now = new Date(Date.UTC(2026, 7, 10)); // known Monday
        const weeks = recentWeekStarts(1, now);
        expect(weeks).toEqual(["2026-08-10"]);
    });
});

describe("computePromptTrend", () => {
    const weeks = ["2026-07-27", "2026-08-03", "2026-08-10"];

    function fact(overrides: Partial<PromptSampleFact>): PromptSampleFact {
        return {
            engineId: "gemini",
            status: "ok",
            ownBrandNamed: false,
            sampledAt: "2026-08-03T12:00:00.000Z",
            ...overrides,
        };
    }

    it("buckets observations into their week and computes a rate", () => {
        const facts = [
            fact({ sampledAt: "2026-08-03T10:00:00.000Z", ownBrandNamed: true }),
            fact({ sampledAt: "2026-08-04T10:00:00.000Z", ownBrandNamed: false }),
        ];
        const trend = computePromptTrend(facts, weeks);
        const gemini = trend.get("gemini")!;
        expect(gemini).toHaveLength(3);
        expect(gemini[1]).toEqual({ weekStart: "2026-08-03", observations: 2, named: 1, rate: 0.5 });
    });

    it("a week with zero observations is a gap (null rate), never a measured zero", () => {
        const facts = [fact({ sampledAt: "2026-08-10T10:00:00.000Z" })];
        const trend = computePromptTrend(facts, weeks);
        const gemini = trend.get("gemini")!;
        expect(gemini[0]).toEqual({ weekStart: "2026-07-27", observations: 0, named: 0, rate: null });
        expect(gemini[1]).toEqual({ weekStart: "2026-08-03", observations: 0, named: 0, rate: null });
    });

    it("excludes no_answer and failed samples from observations", () => {
        const facts = [
            fact({ sampledAt: "2026-08-03T10:00:00.000Z", status: "no_answer" }),
            fact({ sampledAt: "2026-08-03T11:00:00.000Z", status: "failed" }),
        ];
        const trend = computePromptTrend(facts, weeks);
        expect(trend.get("gemini")![1]).toEqual({
            weekStart: "2026-08-03",
            observations: 0,
            named: 0,
            rate: null,
        });
    });

    it("ignores samples outside the requested week window", () => {
        const facts = [fact({ sampledAt: "2025-01-01T00:00:00.000Z" })];
        const trend = computePromptTrend(facts, weeks);
        expect(trend.has("gemini")).toBe(false);
    });

    it("keeps engines separate", () => {
        const facts = [
            fact({ engineId: "gemini", sampledAt: "2026-08-03T10:00:00.000Z", ownBrandNamed: true }),
            fact({ engineId: "perplexity", sampledAt: "2026-08-03T10:00:00.000Z", ownBrandNamed: false }),
        ];
        const trend = computePromptTrend(facts, weeks);
        expect(trend.get("gemini")![1].rate).toBe(1);
        expect(trend.get("perplexity")![1].rate).toBe(0);
    });
});
