import type { CrawlFinding } from "./crawl-findings";
import type { AnswerabilitySignals } from "./answerability";

/** Word-count floor before answerability structure checks apply — a short page has nothing to structure. */
const ANSWERABILITY_MIN_WORDS = 100;
const LONG_STRUCTURE_MIN_WORDS = 300;

/**
 * F5.8 findings for one page.
 *
 * `missing_date_markup`/`missing_author_markup` only fire when the page's
 * OWN JSON-LD already identifies it as Article/BlogPosting — the same
 * restraint as F5.4's `missing_structured_data`. A menu page or a contact
 * page legitimately has no author or publish date; flagging every page
 * lacking byline markup would be blanket noise, not a real finding.
 */
export function answerabilityFindings(
    url: string,
    signals: AnswerabilitySignals,
    pageWordCount: number,
    isArticleType: boolean
): CrawlFinding[] {
    const findings: CrawlFinding[] = [];

    if (pageWordCount >= ANSWERABILITY_MIN_WORDS && !signals.hasDirectAnswerParagraph) {
        findings.push({
            rule: "no_direct_answer",
            severity: "medium",
            pageUrl: url,
            evidence: "No concise paragraph (roughly 15-70 words) found within the first 150 words of visible text",
            fixInstruction: "Open the page with a direct, self-contained answer to the question this page is about — the paragraph an AI system would quote.",
        });
    }

    if (pageWordCount >= LONG_STRUCTURE_MIN_WORDS && !signals.hasExtractableStructure) {
        findings.push({
            rule: "no_extractable_structure",
            severity: "low",
            pageUrl: url,
            evidence: `A ${pageWordCount}-word page with no lists or tables found`,
            fixInstruction: "Break out steps, options, or comparisons into a list or table — structured content is easier for an AI system to extract cleanly.",
        });
    }

    if (signals.averageParagraphWords > 0 && signals.averageParagraphWords >= 200) {
        findings.push({
            rule: "long_paragraphs",
            severity: "low",
            pageUrl: url,
            evidence: `Average paragraph length is ${signals.averageParagraphWords} words`,
            fixInstruction: "Break long paragraphs into shorter chunks — a single quotable idea per paragraph extracts more cleanly than a wall of text.",
        });
    }

    if (isArticleType) {
        if (!signals.hasDateMarkup) {
            findings.push({
                rule: "missing_date_markup",
                severity: "low",
                pageUrl: url,
                evidence: "This page identifies as an Article/BlogPosting but has no <time datetime> element",
                fixInstruction: "Add a <time datetime=\"...\"> element showing when this was published or last updated.",
            });
        }
        if (!signals.hasAuthorMarkup) {
            findings.push({
                rule: "missing_author_markup",
                severity: "low",
                pageUrl: url,
                evidence: "This page identifies as an Article/BlogPosting but has no author byline markup",
                fixInstruction: "Add visible author attribution (rel=\"author\", a byline with an author class, or a <meta name=\"author\">).",
            });
        }
    }

    return findings;
}
