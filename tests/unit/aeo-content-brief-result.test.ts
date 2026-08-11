import { describe, expect, it } from "vitest";
import { parseContentBriefPayload } from "../../src/services/aeo/content-briefs/content-brief-result";

describe("parseContentBriefPayload", () => {
    it("parses a well-formed payload", () => {
        const result = parseContentBriefPayload({
            edit_items: [{ category: "structure", description: "Add a direct-answer paragraph." }],
            faq_items: [{ question: "Do you deliver?", answer: "Yes, within 5 miles." }],
        });
        expect(result.editItems).toEqual([{ category: "structure", description: "Add a direct-answer paragraph." }]);
        expect(result.faqItems).toEqual([{ question: "Do you deliver?", answer: "Yes, within 5 miles." }]);
    });

    it("throws on a non-object payload", () => {
        expect(() => parseContentBriefPayload(null)).toThrow();
        expect(() => parseContentBriefPayload("a string")).toThrow();
    });

    it("throws when both arrays are empty — nothing usable was generated", () => {
        expect(() => parseContentBriefPayload({ edit_items: [], faq_items: [] })).toThrow();
    });

    it("drops malformed individual items rather than failing the whole payload", () => {
        const result = parseContentBriefPayload({
            edit_items: [{ category: "x", description: "y" }, { category: "", description: "missing category" }],
            faq_items: [],
        });
        expect(result.editItems).toHaveLength(1);
    });

    it("caps edit items at 10 and FAQ items at 8", () => {
        const edit_items = Array.from({ length: 20 }, (_, i) => ({ category: "c", description: `d${i}` }));
        const faq_items = Array.from({ length: 20 }, (_, i) => ({ question: `q${i}`, answer: "a" }));
        const result = parseContentBriefPayload({ edit_items, faq_items });
        expect(result.editItems).toHaveLength(10);
        expect(result.faqItems).toHaveLength(8);
    });

    it("handles missing arrays gracefully rather than throwing on undefined", () => {
        expect(() => parseContentBriefPayload({ edit_items: [{ category: "x", description: "y" }] })).not.toThrow();
    });
});
