import { describe, expect, it } from "vitest";

import {
    aiBotBlockedFindings,
    pageLevelFindings,
    robotsUnreachableFinding,
    schemaFindings,
} from "../../src/services/aeo/crawler/crawl-findings";
import { answerabilityFindings } from "../../src/services/aeo/crawler/answerability-findings";
import type { PageSignals } from "../../src/services/aeo/crawler/extract-page-signals";
import { validateSchemaBlocks } from "../../src/services/aeo/crawler/schema-validator";
import type { AnswerabilitySignals } from "../../src/services/aeo/crawler/answerability";

const FULL_SIGNALS: PageSignals = {
    title: "A Page",
    canonicalUrl: "https://example.com/page",
    metaRobots: null,
    h1Count: 1,
    wordCount: 500,
};

describe("aiBotBlockedFindings", () => {
    it("emits one critical, run-level finding per blocked agent", () => {
        const findings = aiBotBlockedFindings(["GPTBot", "ClaudeBot"]);
        expect(findings).toHaveLength(2);
        expect(findings.every((f) => f.severity === "critical" && f.pageUrl === null)).toBe(true);
        expect(findings.map((f) => f.evidence).join()).toContain("GPTBot");
    });

    it("emits nothing for an unblocked site", () => {
        expect(aiBotBlockedFindings([])).toEqual([]);
    });
});

describe("robotsUnreachableFinding", () => {
    it("is medium severity and states the uncertainty rather than assuming allow", () => {
        const finding = robotsUnreachableFinding("HTTP 503");
        expect(finding.severity).toBe("medium");
        expect(finding.pageUrl).toBeNull();
        expect(finding.fixInstruction).toContain("not assumed open");
    });
});

describe("pageLevelFindings — http errors", () => {
    it("flags a 404 as medium, a 500 as high", () => {
        expect(pageLevelFindings("https://x.com/a", 404, null)[0].severity).toBe("medium");
        expect(pageLevelFindings("https://x.com/a", 500, null)[0].severity).toBe("high");
    });

    it("stops at the http_error finding — a page that failed to load has no signals to check further", () => {
        const findings = pageLevelFindings("https://x.com/a", 500, FULL_SIGNALS);
        expect(findings).toHaveLength(1);
        expect(findings[0].rule).toBe("http_error");
    });

    it("a healthy 200 with full signals produces no http_error finding", () => {
        const findings = pageLevelFindings("https://x.com/a", 200, FULL_SIGNALS);
        expect(findings.some((f) => f.rule === "http_error")).toBe(false);
    });
});

describe("pageLevelFindings — canonical", () => {
    it("flags a missing canonical as low severity", () => {
        const findings = pageLevelFindings("https://x.com/a", 200, { ...FULL_SIGNALS, canonicalUrl: null });
        expect(findings.find((f) => f.rule === "missing_canonical")?.severity).toBe("low");
    });

    it("does not flag a page that has one", () => {
        const findings = pageLevelFindings("https://x.com/a", 200, FULL_SIGNALS);
        expect(findings.some((f) => f.rule === "missing_canonical")).toBe(false);
    });
});

describe("pageLevelFindings — thin content (hedged SPA heuristic)", () => {
    it("flags very low word count", () => {
        const findings = pageLevelFindings("https://x.com/a", 200, { ...FULL_SIGNALS, wordCount: 5 });
        const thin = findings.find((f) => f.rule === "thin_content");
        expect(thin?.severity).toBe("medium");
        expect(thin?.evidence).toContain("5 words");
    });

    it("does not flag a normal page", () => {
        const findings = pageLevelFindings("https://x.com/a", 200, FULL_SIGNALS);
        expect(findings.some((f) => f.rule === "thin_content")).toBe(false);
    });

    it("the language hedges 'found', never asserts 'this is an SPA'", () => {
        const findings = pageLevelFindings("https://x.com/a", 200, { ...FULL_SIGNALS, wordCount: 0 });
        const thin = findings.find((f) => f.rule === "thin_content");
        expect(thin?.fixInstruction.toLowerCase()).toContain("if");
    });
});

describe("pageLevelFindings — no signals at all (fetch itself failed, not an HTTP error)", () => {
    it("produces no findings rather than guessing", () => {
        expect(pageLevelFindings("https://x.com/a", null, null)).toEqual([]);
    });
});

describe("schemaFindings", () => {
    function htmlFor(json: string): string {
        return `<script type="application/ld+json">${json}</script>`;
    }

    it("flags a homepage with no identity schema as high severity", () => {
        const validation = validateSchemaBlocks("<html><body>no schema</body></html>");
        const findings = schemaFindings("https://x.com/", validation, true);
        expect(findings).toEqual([
            expect.objectContaining({ rule: "missing_structured_data", severity: "high" }),
        ]);
    });

    it("does NOT flag missing_structured_data on a non-homepage page — no blanket noise", () => {
        const validation = validateSchemaBlocks("<html><body>a normal blog post</body></html>");
        const findings = schemaFindings("https://x.com/blog/post", validation, false);
        expect(findings.some((f) => f.rule === "missing_structured_data")).toBe(false);
    });

    it("a homepage with a LocalBusiness SUBTYPE (Restaurant) is not flagged — matches real wolfpackkc.com markup", () => {
        const validation = validateSchemaBlocks(
            htmlFor(JSON.stringify({ "@type": "Restaurant", name: "Acme Diner", address: "123 Main St" }))
        );
        const findings = schemaFindings("https://x.com/", validation, true);
        expect(findings.some((f) => f.rule === "missing_structured_data")).toBe(false);
    });

    it("a homepage WITH LocalBusiness schema is not flagged for missing_structured_data", () => {
        const validation = validateSchemaBlocks(
            htmlFor(JSON.stringify({ "@type": "LocalBusiness", name: "Acme", address: "123 Main St" }))
        );
        const findings = schemaFindings("https://x.com/", validation, true);
        expect(findings.some((f) => f.rule === "missing_structured_data")).toBe(false);
    });

    it("flags invalid JSON as medium severity", () => {
        const validation = validateSchemaBlocks(`<script type="application/ld+json">{bad json</script>`);
        const findings = schemaFindings("https://x.com/a", validation, false);
        expect(findings).toEqual([expect.objectContaining({ rule: "invalid_json_ld", severity: "medium" })]);
    });

    it("flags a missing required field as incomplete_schema, medium for identity types", () => {
        const validation = validateSchemaBlocks(htmlFor(JSON.stringify({ "@type": "LocalBusiness", name: "Acme" })));
        const findings = schemaFindings("https://x.com/", validation, false);
        expect(findings).toEqual([
            expect.objectContaining({ rule: "incomplete_schema", severity: "medium", evidence: expect.stringContaining("address") }),
        ]);
    });

    it("flags a missing required field as low severity for non-identity types", () => {
        const validation = validateSchemaBlocks(htmlFor(JSON.stringify({ "@type": "FAQPage" })));
        const findings = schemaFindings("https://x.com/faq", validation, false);
        expect(findings).toEqual([expect.objectContaining({ rule: "incomplete_schema", severity: "low" })]);
    });

    it("flags conflicting identity entities as duplicate_conflicting_schema", () => {
        const html = `
            <script type="application/ld+json">{"@type":"LocalBusiness","name":"Acme KC","address":"1 Main St"}</script>
            <script type="application/ld+json">{"@type":"LocalBusiness","name":"Acme STL","address":"2 Oak Ave"}</script>
        `;
        const validation = validateSchemaBlocks(html);
        const findings = schemaFindings("https://x.com/", validation, false);
        expect(findings.some((f) => f.rule === "duplicate_conflicting_schema" && f.severity === "medium")).toBe(true);
    });

    it("a fully valid page produces zero findings", () => {
        const validation = validateSchemaBlocks(
            htmlFor(JSON.stringify({ "@type": "LocalBusiness", name: "Acme", address: "123 Main St" }))
        );
        expect(schemaFindings("https://x.com/", validation, true)).toEqual([]);
    });
});

describe("answerabilityFindings", () => {
    const GOOD_SIGNALS: AnswerabilitySignals = {
        questionHeadingCount: 1,
        hasDirectAnswerParagraph: true,
        hasExtractableStructure: true,
        averageParagraphWords: 50,
        hasDateMarkup: true,
        hasAuthorMarkup: true,
    };

    it("a fully answerable, non-article page produces zero findings", () => {
        expect(answerabilityFindings("https://x.com/a", GOOD_SIGNALS, 500, false)).toEqual([]);
    });

    it("flags no_direct_answer on a substantial page, medium severity", () => {
        const findings = answerabilityFindings(
            "https://x.com/a",
            { ...GOOD_SIGNALS, hasDirectAnswerParagraph: false },
            200,
            false
        );
        expect(findings).toEqual([expect.objectContaining({ rule: "no_direct_answer", severity: "medium" })]);
    });

    it("does not flag no_direct_answer on a short page — nothing to answer yet", () => {
        const findings = answerabilityFindings(
            "https://x.com/a",
            { ...GOOD_SIGNALS, hasDirectAnswerParagraph: false },
            30,
            false
        );
        expect(findings.some((f) => f.rule === "no_direct_answer")).toBe(false);
    });

    it("flags no_extractable_structure only on a long page (300+ words)", () => {
        const short = answerabilityFindings("https://x.com/a", { ...GOOD_SIGNALS, hasExtractableStructure: false }, 150, false);
        expect(short.some((f) => f.rule === "no_extractable_structure")).toBe(false);

        const long = answerabilityFindings("https://x.com/a", { ...GOOD_SIGNALS, hasExtractableStructure: false }, 400, false);
        expect(long.some((f) => f.rule === "no_extractable_structure")).toBe(true);
    });

    it("flags long_paragraphs at or above the 200-word average threshold", () => {
        const findings = answerabilityFindings("https://x.com/a", { ...GOOD_SIGNALS, averageParagraphWords: 250 }, 500, false);
        expect(findings.some((f) => f.rule === "long_paragraphs")).toBe(true);
    });

    it("does not flag missing date/author markup on a non-article page", () => {
        const findings = answerabilityFindings(
            "https://x.com/menu",
            { ...GOOD_SIGNALS, hasDateMarkup: false, hasAuthorMarkup: false },
            500,
            false
        );
        expect(findings.some((f) => f.rule === "missing_date_markup" || f.rule === "missing_author_markup")).toBe(false);
    });

    it("flags missing date AND author markup on an article-type page", () => {
        const findings = answerabilityFindings(
            "https://x.com/blog/post",
            { ...GOOD_SIGNALS, hasDateMarkup: false, hasAuthorMarkup: false },
            500,
            true
        );
        expect(findings.filter((f) => f.rule === "missing_date_markup" || f.rule === "missing_author_markup")).toHaveLength(2);
    });

    it("does not flag date/author markup on an article page that already has both", () => {
        const findings = answerabilityFindings("https://x.com/blog/post", GOOD_SIGNALS, 500, true);
        expect(findings).toEqual([]);
    });
});
