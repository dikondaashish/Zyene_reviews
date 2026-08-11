import { isObservation, type EngineSampleResult } from "../engines/engine-types";
import { matchKnownBrands, type BrandAlias, type BrandMatch } from "./brand-matcher";
import { normalizeCitation, type NormalizedCitation } from "./citation-normalizer";

/**
 * E-6: turn one stored sample into brand mentions and classified citations.
 *
 * Runs AFTER the sample is durable and outside the reserve/call/settle shape,
 * because it spends nothing and can be re-run at will. A failure here must never
 * cost a sample that was already paid for.
 *
 * `extraction_model_id` is required on every mention row. For this pass it
 * records a METHOD rather than a model — the presence decision is a string
 * match, not an inference, and saying so is the difference between a claim that
 * can be audited and one that has to be trusted.
 */
export const DETERMINISTIC_EXTRACTOR_ID = "deterministic-alias-v1";

export type BrandContext = {
    brands: readonly BrandAlias[];
    ownDomains: readonly string[];
    competitorDomains: readonly string[];
};

export type SampleExtraction = {
    mentions: BrandMatch[];
    citations: NormalizedCitation[];
    extractionModelId: string;
    /**
     * Whether our brand was NAMED in the answer prose. The headline number.
     * Null when the sample is not an observation — a failed call or a refusal is
     * not evidence of absence, and must never be counted as "not visible".
     */
    ownBrandNamed: boolean | null;
};

export function extractSample(
    result: EngineSampleResult,
    context: BrandContext
): SampleExtraction {
    // A failed or refused sample has no answer to read. Returning empty with
    // ownBrandNamed = null keeps it out of every denominator rather than
    // silently scoring it as a miss (QA #2).
    if (!isObservation(result)) {
        return {
            mentions: [],
            citations: [],
            extractionModelId: DETERMINISTIC_EXTRACTOR_ID,
            ownBrandNamed: null,
        };
    }

    const citations = result.citations.items.map((item) =>
        normalizeCitation({ url: item.url, title: item.title }, context)
    );

    // Citations feed brand matching too: a business can be a source without
    // being named. Both the URL and the title are searched, because the brand
    // may appear in either.
    const citationText = result.citations.items.flatMap((item) => [
        item.url,
        item.title ?? "",
    ]);

    const mentions = matchKnownBrands({
        answerText: result.answerText,
        citationText,
        brands: context.brands,
    });

    return {
        mentions,
        citations,
        extractionModelId: DETERMINISTIC_EXTRACTOR_ID,
        ownBrandNamed: mentions.some((m) => m.kind === "own" && !m.citedOnly),
    };
}
