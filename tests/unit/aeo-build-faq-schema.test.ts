import { describe, expect, it } from "vitest";
import { buildFaqJsonLd, buildFaqJsonLdScriptTag, buildFaqHtml } from "../../src/services/aeo/content-briefs/build-faq-schema";

const ITEMS = [
    { question: "Do you take reservations?", answer: "Yes, book online or call us." },
    { question: "Is there parking?", answer: "Free lot parking is available." },
];

describe("buildFaqJsonLd", () => {
    it("produces a valid FAQPage structure with one Question per item", () => {
        const schema = buildFaqJsonLd(ITEMS);
        expect(schema["@type"]).toBe("FAQPage");
        expect((schema.mainEntity as unknown[])).toHaveLength(2);
    });

    it("preserves question/answer text verbatim in the structure", () => {
        const schema = buildFaqJsonLd(ITEMS) as { mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }> };
        expect(schema.mainEntity[0].name).toBe("Do you take reservations?");
        expect(schema.mainEntity[0].acceptedAnswer.text).toBe("Yes, book online or call us.");
    });

    it("handles zero items without throwing", () => {
        expect(() => buildFaqJsonLd([])).not.toThrow();
        expect((buildFaqJsonLd([]).mainEntity as unknown[])).toEqual([]);
    });
});

describe("buildFaqJsonLdScriptTag", () => {
    it("wraps the JSON in a real script tag", () => {
        const tag = buildFaqJsonLdScriptTag(ITEMS);
        expect(tag).toMatch(/^<script type="application\/ld\+json">/);
        expect(tag).toContain("FAQPage");
    });

    it("escapes a literal </script> in answer text so it cannot break out of the tag", () => {
        const malicious = [{ question: "q", answer: "</script><script>alert(1)</script>" }];
        const tag = buildFaqJsonLdScriptTag(malicious);
        expect(tag).not.toContain("</script><script>alert");
    });
});

describe("buildFaqHtml", () => {
    it("HTML-escapes question and answer text", () => {
        const html = buildFaqHtml([{ question: "<b>bold</b>?", answer: "yes & no" }]);
        expect(html).not.toContain("<b>bold</b>");
        expect(html).toContain("&lt;b&gt;");
        expect(html).toContain("yes &amp; no");
    });

    it("produces one .faq-item block per FAQ item", () => {
        const html = buildFaqHtml(ITEMS);
        expect(html.match(/faq-item/g)).toHaveLength(2);
    });
});
