import { describe, expect, it } from "vitest";
import { computeRepeatVariance } from "@/services/aeo/analytics/sampling-variance";
import { matchReviewCorpus } from "@/services/aeo/analytics/review-citation-matcher";

describe("honest evidence from sparse observations", () => {
    it("does not report certainty after three misses", () => {
        const result = computeRepeatVariance([false, false, false]);
        expect(result.confidence95.low).toBe(0);
        expect(result.confidence95.high).toBeGreaterThan(0.5);
    });
    it("does not report certainty after three successes", () => {
        const result = computeRepeatVariance([true, true, true]);
        expect(result.confidence95.low).toBeLessThan(0.5);
        expect(result.confidence95.high).toBe(1);
    });
    it("does not match a generic review to an unrelated restaurant answer", () => {
        expect(matchReviewCorpus("This quality establishment serves Kansas City bbq.", [
            { id: "generic", text: "10/10 for Kansas City bbq" },
        ])).toEqual([]);
    });
});
