import { describe, expect, it } from "vitest";
import { assertSingleBusinessBatch, isAllowedAnalysisResult } from "@/services/ai/analysis-batch-boundary";

describe("analysis batch tenant boundary", () => {
    it("rejects mixed-tenant and missing reviews", () => {
        expect(() => assertSingleBusinessBatch(["a", "b"], [
            { id: "a", business_id: "one" }, { id: "b", business_id: "two" },
        ])).toThrow();
        expect(() => assertSingleBusinessBatch(["a", "b"], [
            { id: "a", business_id: "one" },
        ])).toThrow();
    });

    it("rejects IDs invented by the model", () => {
        const { allowedIds } = assertSingleBusinessBatch(["a"], [{ id: "a", business_id: "one" }]);
        expect(isAllowedAnalysisResult("foreign-review", allowedIds)).toBe(false);
        expect(isAllowedAnalysisResult("a", allowedIds)).toBe(true);
    });
});
