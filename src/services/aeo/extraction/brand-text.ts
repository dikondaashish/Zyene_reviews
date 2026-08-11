

/**
 * Text primitives for brand matching.
 *
 * Split from the matcher because these decide the SHAPE of a match — what
 * counts as the same string — while the matcher decides what a match MEANS.
 * They are also where every false-positive risk lives, so they are worth
 * reading and testing on their own.
 */

/**
 * Answers arrive with markdown emphasis (`**Blue Dragon Plumbing**`), smart
 * quotes and non-breaking spaces. Normalising both sides keeps those from
 * deciding whether a business counts as visible.
 *
 * Deliberately NOT stripping punctuation wholesale: "Bob's Plumbing" and "Bobs
 * Plumbing" are handled by generating alias variants instead, so the matcher
 * stays exact and predictable rather than fuzzy.
 */
export function normalizeForMatch(text: string): string {
    return text
        .toLowerCase()
        .replace(/[‘’ʼ]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/[*_`~]/g, "")
        .replace(/ /g, " ")
        .replace(/\s+/g, " ");
}

/** Escapes a string for literal use inside a RegExp. */
export function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Word-boundary match, so "Ace" does not fire inside "Aceituna" — but a plain
 * `\b` is wrong at the edges of names ending in punctuation ("Bob's"), so the
 * boundary is asserted only where the alias itself starts/ends with a word
 * character.
 */
export function buildAliasPattern(alias: string): RegExp {
    const normalized = normalizeForMatch(alias);
    const escaped = escapeRegExp(normalized);
    const left = /^\w/.test(normalized) ? "\\b" : "";
    const right = /\w$/.test(normalized) ? "\\b" : "";
    return new RegExp(`${left}${escaped}${right}`, "i");
}

/**
 * Strips everything but letters and digits.
 *
 * Domains carry brand names with the spaces removed —
 * `bluedragonplumbing.test`, `blue-dragon-plumbing.test` — so a spaced alias can
 * never match one. Compacting both sides is the only way a citation to a
 * business's own site is recognised as that business.
 */
export function compact(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Compact matching has no word boundaries to lean on, so a short name would
 * collide with unrelated hosts ("ace" inside "acebook.com"). Below this length
 * the brand is simply not looked for in citations.
 *
 * That is a deliberate MISS rather than a risked false positive: an unreported
 * citation understates visibility, which is recoverable and honest, whereas an
 * invented one is the failure this module exists to prevent.
 */
export const MIN_COMPACT_ALIAS_LENGTH = 6;

/** Earliest position of any alias within already-compacted citation text. */
export function firstCompactOccurrence(
    compactHaystack: string,
    aliases: readonly string[]
): { index: number; alias: string } | null {
    let best: { index: number; alias: string } | null = null;

    for (const alias of aliases) {
        const needle = compact(alias);
        if (needle.length < MIN_COMPACT_ALIAS_LENGTH) continue;

        const index = compactHaystack.indexOf(needle);
        if (index === -1) continue;
        if (best === null || index < best.index) {
            best = { index, alias: alias.trim() };
        }
    }
    return best;
}

/**
 * Finds the earliest position at which any alias for this brand appears.
 * Returns the winning alias too, so a surprising match can be explained.
 */
export function firstOccurrence(
    haystack: string,
    aliases: readonly string[]
): { index: number; alias: string } | null {
    let best: { index: number; alias: string } | null = null;

    for (const alias of aliases) {
        const trimmed = alias.trim();
        // A one- or two-character alias would match almost any text. Silently
        // ignoring it is safer than letting it manufacture visibility.
        if (trimmed.length < 3) continue;

        const match = buildAliasPattern(trimmed).exec(haystack);
        if (!match) continue;
        if (best === null || match.index < best.index) {
            best = { index: match.index, alias: trimmed };
        }
    }
    return best;
}

