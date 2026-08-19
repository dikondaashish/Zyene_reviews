/**
 * F5.8: answerability heuristics — is this page shaped so an AI system can
 * extract a direct answer from it, independent of whether the CONTENT is
 * good. Regex over well-formed markup, same approach and same limits as
 * extract-page-signals.ts: narrow, well-defined tag patterns only.
 *
 * "Entity clarity" from the PRD's F5.8 list is deliberately NOT a separate
 * check here — F5.4's LocalBusiness/Organization identity validation already
 * answers "is it clear who this page is about," and a second heuristic path
 * asking the same question would add false-positive surface without new
 * signal. Scoped out, not silently dropped.
 */

export type AnswerabilitySignals = {
    questionHeadingCount: number;
    hasDirectAnswerParagraph: boolean;
    hasExtractableStructure: boolean;
    averageParagraphWords: number;
    hasDateMarkup: boolean;
    hasAuthorMarkup: boolean;
};

const QUESTION_HEADING_RE = /^(what|how|why|when|where|who|which|can|does|do|is|are|will|should)\b/i;

/** Direct-answer window: an AI extracting "the answer" reads the opening of a page, not page 3. */
const DIRECT_ANSWER_WORD_WINDOW = 150;
const DIRECT_ANSWER_MIN_WORDS = 15;
const DIRECT_ANSWER_MAX_WORDS = 70;

function decodeEntities(text: string): string {
    return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ");
}

function stripTags(html: string): string {
    return decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function wordCount(text: string): number {
    return text.length === 0 ? 0 : text.split(" ").filter(Boolean).length;
}

function headingTexts(html: string): string[] {
    const matches = html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi);
    return [...matches].map((m) => stripTags(m[1]));
}

function paragraphTexts(html: string): string[] {
    const matches = html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
    return [...matches].map((m) => stripTags(m[1])).filter((t) => t.length > 0);
}

export function computeAnswerabilitySignals(html: string): AnswerabilitySignals {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const body = bodyMatch ? bodyMatch[1] : html;

    const headings = headingTexts(body);
    const questionHeadingCount = headings.filter((h) => QUESTION_HEADING_RE.test(h.trim())).length;

    const paragraphs = paragraphTexts(body);

    // Direct-answer paragraph: a concise paragraph whose own text ends within
    // the first DIRECT_ANSWER_WORD_WINDOW words of visible body text — not
    // just "some short paragraph exists somewhere on the page".
    let wordsSoFar = 0;
    let hasDirectAnswerParagraph = false;
    for (const p of paragraphs) {
        const words = wordCount(p);
        const endsWithinWindow = wordsSoFar + words <= DIRECT_ANSWER_WORD_WINDOW;
        if (endsWithinWindow && words >= DIRECT_ANSWER_MIN_WORDS && words <= DIRECT_ANSWER_MAX_WORDS) {
            hasDirectAnswerParagraph = true;
            break;
        }
        wordsSoFar += words;
        if (wordsSoFar > DIRECT_ANSWER_WORD_WINDOW) break;
    }

    const hasExtractableStructure = /<(ul|ol|table)[\s>]/i.test(body);

    const paragraphWordCounts = paragraphs.map(wordCount).filter((w) => w > 0);
    const averageParagraphWords =
        paragraphWordCounts.length === 0
            ? 0
            : Math.round(paragraphWordCounts.reduce((a, b) => a + b, 0) / paragraphWordCounts.length);

    const hasDateMarkup = /<time\b[^>]*\bdatetime\s*=/i.test(body);
    const hasAuthorMarkup =
        /rel\s*=\s*["']author["']/i.test(body) ||
        /<meta\b[^>]*name\s*=\s*["']author["']/i.test(body) ||
        /class\s*=\s*["'][^"']*\bauthor\b/i.test(body);

    return {
        questionHeadingCount,
        hasDirectAnswerParagraph,
        hasExtractableStructure,
        averageParagraphWords,
        hasDateMarkup,
        hasAuthorMarkup,
    };
}
