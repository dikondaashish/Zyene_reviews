import { logger } from "@/lib/logger";
import { checkOriginIsPublic } from "../crawler/ssrf-guard";
import { extractPageSignals } from "../crawler/extract-page-signals";
import { computeAnswerabilitySignals } from "../crawler/answerability";
import { validateSchemaBlocks } from "../crawler/schema-validator";

/**
 * F6.1's "fetch and structure the cited sources" — competitor/third-party
 * URLs from real citation data, not ones this app chose. The exact same
 * class of outbound-fetch risk the crawler's SSRF guard exists for, reused
 * here rather than duplicated: a citation could in principle point at an
 * internal address if an engine's grounding ever returned one.
 */
export type CitedSourceStructure = {
    url: string;
    ok: boolean;
    title: string | null;
    wordCount: number;
    hasQuestionHeadings: boolean;
    hasDirectAnswer: boolean;
    hasFaqSchema: boolean;
    contentExcerpt: string;
};

export type FetchCitedSourceResult =
    | { ok: true; structure: CitedSourceStructure }
    | { ok: false; reason: "unsafe_origin" | "fetch_failed" | "not_ok"; detail: string };

/** A cited page we don't control must not be allowed to hang this call indefinitely. */
const CITED_SOURCE_FETCH_TIMEOUT_MS = 10_000;

/** Same script/style-stripping approach as extract-page-signals.ts's countWords — visible text only, entities decoded. */
function extractVisibleText(html: string): string {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const body = bodyMatch ? bodyMatch[1] : html;
    const stripped = body
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ");
    return stripped
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export async function fetchCitedSource(url: string): Promise<FetchCitedSourceResult> {
    const safety = await checkOriginIsPublic(url);
    if (!safety.safe) {
        return { ok: false, reason: "unsafe_origin", detail: safety.reason };
    }

    let html: string;
    try {
        const response = await fetch(url, {
            headers: { "User-Agent": "ZyeneReviewsBot/1.0 (+https://zyenereviews.com/bot)" },
            signal: AbortSignal.timeout(CITED_SOURCE_FETCH_TIMEOUT_MS),
        });
        if (!response.ok) {
            return { ok: false, reason: "not_ok", detail: `HTTP ${response.status}` };
        }
        html = await response.text();
    } catch (error) {
        logger.warn({ err: error, url }, "[content-briefs] cited source fetch failed");
        return { ok: false, reason: "fetch_failed", detail: error instanceof Error ? error.message : "unknown" };
    }

    const signals = extractPageSignals(html);
    const answerability = computeAnswerabilitySignals(html);
    const schema = validateSchemaBlocks(html);
    const excerptSource = extractVisibleText(html);

    return {
        ok: true,
        structure: {
            url,
            ok: true,
            title: signals.title,
            wordCount: signals.wordCount,
            hasQuestionHeadings: answerability.questionHeadingCount > 0,
            hasDirectAnswer: answerability.hasDirectAnswerParagraph,
            hasFaqSchema: schema.entitiesFound.some((e) => e.type === "FAQPage"),
            contentExcerpt: excerptSource.slice(0, 1500),
        },
    };
}
