import { describe, expect, it } from "vitest";
import { ensureCompleteReviewText, isCompleteReviewText } from "../../src/lib/review-flow/ensure-complete-review";

describe("ensureCompleteReviewText", () => {
    it("accepts complete sentences", () => {
        const text =
            "Melad offered friendly service. Precise Duct Cleaning is a great choice.";
        expect(isCompleteReviewText(text)).toBe(true);
        expect(ensureCompleteReviewText(text, "Precise Duct Cleaning")).toBe(text);
    });

    it("fixes truncated tail like the client report", () => {
        const broken =
            "Melad offered such friendly and professional service while keeping the entire work area spotless. This reliable team exceeded expectations by being thorough and attentive to every detail of the job. Anyone searching for a top-";
        const fixed = ensureCompleteReviewText(broken, "Precise Duct Cleaning");
        expect(fixed).not.toMatch(/top-\s*$/i);
        expect(fixed.endsWith(".") || fixed.endsWith("!") || fixed.endsWith("?")).toBe(true);
        expect(fixed.toLowerCase()).toContain("precise");
    });

    it("appends business name when missing from repaired text", () => {
        const fixed = ensureCompleteReviewText("Great service and very professional team", "Acme HVAC");
        expect(fixed.toLowerCase()).toContain("acme");
        expect(isCompleteReviewText(fixed)).toBe(true);
    });
});
