import type { CitedSourceStructure } from "./fetch-cited-source";

/**
 * F6.1's structural half — what the cited pages have that ours does not,
 * as facts a prompt can hand to Gemini, not as prose Gemini has to notice
 * on its own. Deterministic and testable independent of any AI call.
 */
export type OwnPageStructure = {
    hasFaqSchema: boolean;
    hasQuestionHeadings: boolean;
    hasDirectAnswer: boolean;
    hasLocalBusinessSchema: boolean;
} | null; // null: PRD-7's "no suitable owning page exists" edge case.

export type CitationGap = {
    missingFaqSchema: boolean;
    missingQuestionHeadings: boolean;
    missingDirectAnswer: boolean;
    missingLocalBusinessSchema: boolean;
    citedSourceCount: number;
    /** True when every citation fetch failed (paywalled/blocked) — PRD-7's lower-confidence edge case. */
    allSourcesUnreachable: boolean;
};

export function analyzeCitationGap(
    ownPage: OwnPageStructure,
    citedSources: readonly { ok: boolean; structure?: CitedSourceStructure }[]
): CitationGap {
    const reachable = citedSources.filter((s): s is { ok: true; structure: CitedSourceStructure } => s.ok);
    const citedHasFaq = reachable.some((s) => s.structure.hasFaqSchema);
    const citedHasQuestions = reachable.some((s) => s.structure.hasQuestionHeadings);
    const citedHasDirectAnswer = reachable.some((s) => s.structure.hasDirectAnswer);

    return {
        missingFaqSchema: citedHasFaq && !(ownPage?.hasFaqSchema ?? false),
        missingQuestionHeadings: citedHasQuestions && !(ownPage?.hasQuestionHeadings ?? false),
        missingDirectAnswer: citedHasDirectAnswer && !(ownPage?.hasDirectAnswer ?? false),
        missingLocalBusinessSchema: !(ownPage?.hasLocalBusinessSchema ?? false),
        citedSourceCount: citedSources.length,
        allSourcesUnreachable: citedSources.length > 0 && reachable.length === 0,
    };
}
