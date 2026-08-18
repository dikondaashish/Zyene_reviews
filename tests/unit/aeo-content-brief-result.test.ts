import { describe, expect, it } from "vitest";
import { parseContentBriefPayload } from "../../src/services/aeo/content-briefs/content-brief-result";

describe("parseContentBriefPayload", () => {
    const edits = [
        { category: "structure", description: "Add a direct-answer paragraph for the target question." },
        { category: "content", description: "Compare the two services named on the current page." },
        { category: "schema", description: "Add FAQPage JSON-LD for the proposed questions." },
    ];

    it("parses a well-formed payload", () => {
        const result = parseContentBriefPayload({
            edit_items: edits,
            faq_items: [{ question: "Do you deliver?", answer: "Yes, within 5 miles." }],
        });
        expect(result.editItems).toEqual(edits);
        expect(result.faqItems).toEqual([{ question: "Do you deliver?", answer: "Yes, within 5 miles." }]);
    });

    it("throws on a non-object payload", () => {
        expect(() => parseContentBriefPayload(null)).toThrow();
        expect(() => parseContentBriefPayload("a string")).toThrow();
    });

    it("throws when both arrays are empty — nothing usable was generated", () => {
        expect(() => parseContentBriefPayload({ edit_items: [], faq_items: [] })).toThrow();
    });

    it("rejects output left with fewer than three concrete edit items", () => {
        expect(() => parseContentBriefPayload({
            edit_items: [edits[0], { category: "", description: "missing category" }],
            faq_items: [{ question: "Does this help?", answer: "Yes." }],
        })).toThrow(/at least three/i);
    });

    it("caps edit items at 10 and FAQ items at 8", () => {
        const edit_items = Array.from({ length: 20 }, (_, i) => ({
            category: "content",
            description: `Add page-specific supporting detail number ${i} to the target section.`,
        }));
        const faq_items = Array.from({ length: 20 }, (_, i) => ({ question: `q${i}`, answer: "a" }));
        const result = parseContentBriefPayload({ edit_items, faq_items });
        expect(result.editItems).toHaveLength(10);
        expect(result.faqItems).toHaveLength(8);
    });

    it("requires edit items even when FAQ output is present", () => {
        expect(() => parseContentBriefPayload({ faq_items: [{ question: "Q?", answer: "A." }] })).toThrow();
    });
});
