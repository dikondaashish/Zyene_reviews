import { describe, expect, it } from "vitest";
import { computeAnswerabilitySignals } from "../../src/services/aeo/crawler/answerability";

function page(bodyHtml: string): string {
    return `<html><head><title>Test</title></head><body>${bodyHtml}</body></html>`;
}

describe("computeAnswerabilitySignals — question headings", () => {
    it("counts H2/H3 headings phrased as questions", () => {
        const html = page("<h2>What is the best BBQ in Kansas City?</h2><h3>How do I place an order?</h3><h2>Menu</h2>");
        expect(computeAnswerabilitySignals(html).questionHeadingCount).toBe(2);
    });

    it("zero for a page with only statement headings", () => {
        const html = page("<h2>Our Menu</h2><h3>Catering</h3>");
        expect(computeAnswerabilitySignals(html).questionHeadingCount).toBe(0);
    });

    it("does not count H1 (only H2/H3, matching real FAQ structure)", () => {
        const html = page("<h1>What is BBQ?</h1>");
        expect(computeAnswerabilitySignals(html).questionHeadingCount).toBe(0);
    });
});

describe("computeAnswerabilitySignals — direct-answer paragraph", () => {
    it("true when a concise paragraph appears near the top", () => {
        const words = Array.from({ length: 30 }, () => "word").join(" ");
        const html = page(`<p>${words}</p>`);
        expect(computeAnswerabilitySignals(html).hasDirectAnswerParagraph).toBe(true);
    });

    it("false when the first paragraph is too short to be a real answer", () => {
        const html = page("<p>Hi there.</p>");
        expect(computeAnswerabilitySignals(html).hasDirectAnswerParagraph).toBe(false);
    });

    it("false when the only concise paragraph appears far down the page", () => {
        const filler = Array.from({ length: 300 }, () => "word").join(" ");
        const concise = Array.from({ length: 30 }, () => "answer").join(" ");
        const html = page(`<p>${filler}</p><p>${concise}</p>`);
        expect(computeAnswerabilitySignals(html).hasDirectAnswerParagraph).toBe(false);
    });

    it("false for a page with no paragraphs at all", () => {
        const html = page("<div>No p tags here</div>");
        expect(computeAnswerabilitySignals(html).hasDirectAnswerParagraph).toBe(false);
    });
});

describe("computeAnswerabilitySignals — extractable structure", () => {
    it("true when the page has a list", () => {
        expect(computeAnswerabilitySignals(page("<ul><li>One</li></ul>")).hasExtractableStructure).toBe(true);
    });

    it("true when the page has a table", () => {
        expect(computeAnswerabilitySignals(page("<table><tr><td>x</td></tr></table>")).hasExtractableStructure).toBe(true);
    });

    it("false for a page with only prose", () => {
        expect(computeAnswerabilitySignals(page("<p>Just prose.</p>")).hasExtractableStructure).toBe(false);
    });
});

describe("computeAnswerabilitySignals — paragraph length", () => {
    it("computes the average word count across paragraphs", () => {
        const html = page("<p>one two three four five</p><p>one two three</p>");
        expect(computeAnswerabilitySignals(html).averageParagraphWords).toBe(4);
    });

    it("zero average for a page with no paragraphs", () => {
        expect(computeAnswerabilitySignals(page("<div>text</div>")).averageParagraphWords).toBe(0);
    });
});

describe("computeAnswerabilitySignals — date and author markup", () => {
    it("detects a <time datetime> element", () => {
        expect(computeAnswerabilitySignals(page('<time datetime="2026-01-01">Jan 1</time>')).hasDateMarkup).toBe(true);
    });

    it("does not flag a <time> tag with no datetime attribute", () => {
        expect(computeAnswerabilitySignals(page("<time>Jan 1</time>")).hasDateMarkup).toBe(false);
    });

    it("detects rel=author", () => {
        expect(computeAnswerabilitySignals(page('<a rel="author">Jane</a>')).hasAuthorMarkup).toBe(true);
    });

    it("detects meta name=author", () => {
        expect(computeAnswerabilitySignals(page('<meta name="author" content="Jane">')).hasAuthorMarkup).toBe(true);
    });

    it("detects a class containing author", () => {
        expect(computeAnswerabilitySignals(page('<span class="post-author">Jane</span>')).hasAuthorMarkup).toBe(true);
    });

    it("false when neither date nor author markup exists", () => {
        const signals = computeAnswerabilitySignals(page("<p>Plain content.</p>"));
        expect(signals.hasDateMarkup).toBe(false);
        expect(signals.hasAuthorMarkup).toBe(false);
    });
});

describe("computeAnswerabilitySignals — never crashes on malformed markup", () => {
    it("handles a page with no body tag", () => {
        expect(() => computeAnswerabilitySignals("<html>no body here</html>")).not.toThrow();
    });

    it("handles an empty string", () => {
        expect(() => computeAnswerabilitySignals("")).not.toThrow();
    });

    it("handles unclosed tags", () => {
        expect(() => computeAnswerabilitySignals(page("<p>unclosed"))).not.toThrow();
    });
});
