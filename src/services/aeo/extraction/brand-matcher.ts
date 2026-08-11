/**
 * E-6: deciding whether a brand appears in an engine's answer.
 *
 * This is the number the whole product reports, and it is the exact number the
 * pre-Phase-1 surfaces fabricated. So it is computed DETERMINISTICALLY, by
 * matching known names against the answer text — not by asking a model "is this
 * business mentioned?".
 *
 * A model can hallucinate a mention. A string matcher cannot: every hit points
 * at a real span of text an auditor can go and look at. That property is worth
 * more here than any gain in recall, because a false positive is
 * indistinguishable from the original bug.
 *
 * An LLM pass still has a place — discovering brands we have never heard of,
 * and reading sentiment — but it runs SEPARATELY and cannot influence whether
 * the business itself was found. See brand-extraction.ts.
 */

export type BrandKind = "own" | "competitor" | "unknown";

export type BrandAlias = {
    kind: BrandKind;
    /** Null for `own` and `unknown`; a competitors.id for `competitor`. */
    competitorId: string | null;
    /** Canonical display name, persisted as brand_label. */
    label: string;
    /** Every string that means this brand, including the label itself. */
    aliases: readonly string[];
};

export type BrandMatch = {
    kind: BrandKind;
    competitorId: string | null;
    label: string;
    /** 1-based order of FIRST mention across all matched brands. */
    mentionOrdinal: number;
    /** Appears only in cited sources, never in the answer prose. */
    citedOnly: boolean;
    /** The alias that actually matched, for auditing a surprising result. */
    matchedAlias: string;
    /** Character offset of the first prose mention; null when cited-only. */
    firstIndex: number | null;
};

import {
    compact,
    firstCompactOccurrence,
    firstOccurrence,
    normalizeForMatch,
} from "./brand-text";

export { normalizeForMatch } from "./brand-text";

export type MatchInput = {
    answerText: string;
    /** Citation URLs and titles. A brand can be sourced without being named. */
    citationText: readonly string[];
    brands: readonly BrandAlias[];
};

/**
 * Which of the known brands appear, and where.
 *
 * Ordinals are assigned by position of first prose mention, so "who did the
 * engine name first" is answerable (F3.4 prominence). Cited-only brands sort
 * after every named brand: being a source is real visibility, but it is not the
 * same as being recommended, and collapsing the two would overstate presence.
 */
export function matchKnownBrands(input: MatchInput): BrandMatch[] {
    const prose = normalizeForMatch(input.answerText);
    // Citations are matched compacted, because a URL spells a brand without
    // spaces. Prose keeps word boundaries, where they are what prevents "Ace"
    // firing inside "Aceituna".
    const citedCompact = compact(input.citationText.join(" "));

    const named: BrandMatch[] = [];
    const citedOnly: BrandMatch[] = [];

    for (const brand of input.brands) {
        const inProse = firstOccurrence(prose, brand.aliases);
        if (inProse) {
            named.push({
                kind: brand.kind,
                competitorId: brand.competitorId,
                label: brand.label,
                mentionOrdinal: 0, // assigned below, once ordering is known
                citedOnly: false,
                matchedAlias: inProse.alias,
                firstIndex: inProse.index,
            });
            continue;
        }

        const inCitations = firstCompactOccurrence(citedCompact, brand.aliases);
        if (inCitations) {
            citedOnly.push({
                kind: brand.kind,
                competitorId: brand.competitorId,
                label: brand.label,
                mentionOrdinal: 0,
                citedOnly: true,
                matchedAlias: inCitations.alias,
                firstIndex: null,
            });
        }
    }

    named.sort((a, b) => (a.firstIndex ?? 0) - (b.firstIndex ?? 0));

    return [...named, ...citedOnly].map((match, index) => ({
        ...match,
        mentionOrdinal: index + 1,
    }));
}

/**
 * Whether OUR business was named in the answer prose.
 *
 * The headline visibility number. Deliberately excludes cited-only hits: a
 * citation means a page of ours was used as a source, which is worth tracking
 * separately but is not the engine recommending the business. Reporting them
 * together is how a modest result gets presented as a good one.
 */
export function ownBrandNamed(matches: readonly BrandMatch[]): boolean {
    return matches.some((m) => m.kind === "own" && !m.citedOnly);
}

/** Own-brand position among named brands, or null when not named. */
export function ownBrandRank(matches: readonly BrandMatch[]): number | null {
    const named = matches.filter((m) => !m.citedOnly);
    const index = named.findIndex((m) => m.kind === "own");
    return index === -1 ? null : index + 1;
}
