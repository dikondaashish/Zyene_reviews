/**
 * F4.2 — suggested prompts, generated from the business's own Google data.
 *
 * Deterministic templates, not an LLM call. Three reasons, in order of weight:
 *
 *  1. QA criterion #20 requires ≥80% of suggestions to contain the business's
 *     city or category. A template that interpolates those fields satisfies
 *     that by construction; a generated one would have to be measured and
 *     could regress silently on a model change.
 *  2. Suggestions are produced for every business that connects Google. Paying
 *     per generation for text that is this formulaic is spending money to make
 *     the output less predictable.
 *  3. Every suggestion must be traceable to a real field. Templates can only
 *     interpolate what was passed in, so a business with no category cannot
 *     receive an invented one.
 *
 * Nothing here activates anything: suggestions are written `is_active = false`
 * with `source = 'suggested'`, and enrolling one into a paid run stays a
 * separate, human click (F4.1's rule, unchanged).
 */

export type PromptIntent = "discovery" | "comparison" | "transactional" | "branded";

export type PromptSuggestion = {
    promptText: string;
    intent: PromptIntent;
    localeCity: string | null;
    /** F4.3 — the cluster this suggestion is filed under. */
    clusterName: string;
    sourceQuery?: string | null;
    discoveryScore?: number | null;
};

export type SuggestPromptsInput = {
    businessName: string;
    /** GBP primary category, e.g. "Barbecue restaurant". Required. */
    category: string | null;
    city: string | null;
};

/** Cluster names are stable strings: re-running must reuse, not duplicate. */
export const PROMPT_CLUSTERS = {
    discovery: "Finding a provider",
    comparison: "Comparing options",
    transactional: "Booking & pricing",
    branded: "Brand reputation",
} as const;

type Template = {
    /** `{category}`, `{city}` and `{business}` are the only tokens. */
    text: string;
    intent: PromptIntent;
};

/**
 * Ordered by usefulness, because a business with a short category list still
 * gets its strongest prompts first if this is ever truncated.
 *
 * The last two deliberately omit both city and category — a real person asking
 * about a business by name alone is a genuine query shape, and dropping it
 * would make the set tidier than reality. They are kept to 2 of 20 (10%) so
 * the ≥80% floor in criterion #20 holds with margin.
 */
const TEMPLATES: readonly Template[] = [
    { text: "best {category} in {city}", intent: "discovery" },
    { text: "top rated {category} in {city}", intent: "discovery" },
    { text: "where to find a good {category} in {city}", intent: "discovery" },
    { text: "affordable {category} in {city}", intent: "discovery" },
    { text: "{category} in {city} open now", intent: "discovery" },
    { text: "recommended {category} near {city}", intent: "discovery" },
    { text: "best {category} in {city} for families", intent: "comparison" },
    { text: "{category} in {city} with the best reviews", intent: "comparison" },
    { text: "which {category} in {city} should I choose", intent: "comparison" },
    { text: "most popular {category} in {city}", intent: "comparison" },
    { text: "how much does a {category} in {city} cost", intent: "transactional" },
    { text: "book a {category} in {city}", intent: "transactional" },
    { text: "{category} in {city} that takes walk-ins", intent: "transactional" },
    { text: "{category} in {city} with online booking", intent: "transactional" },
    { text: "is {business} in {city} any good", intent: "branded" },
    { text: "{business} {city} reviews", intent: "branded" },
    { text: "{business} vs other {category} in {city}", intent: "branded" },
    // Category-bearing on purpose. The two templates above lean on {city} for
    // their coverage, so with no city on file they degrade to brand-only and
    // the set drops under criterion #20's 80% floor. These three carry the
    // category instead, which no business is missing (suggestPrompts refuses
    // without one), so the floor holds in both shapes.
    { text: "is {business} a good {category} in {city}", intent: "branded" },
    { text: "how does {business} compare to other {category} options", intent: "branded" },
    { text: "what do customers say about {business}", intent: "branded" },
];

/** Collapses whitespace left behind when an absent token is removed. */
function tidy(text: string): string {
    return text.replace(/\s+/g, " ").replace(/\s+([,?])/g, "$1").trim();
}

/**
 * Fills a template, dropping the locative phrase entirely when there is no
 * city rather than emitting "best plumber in ". A prompt naming a place we
 * do not have is worse than a prompt that omits the place.
 */
function render(template: string, values: { category: string; city: string | null; business: string }): string {
    let text = template;
    if (values.city) {
        text = text.replace(/\{city\}/g, values.city);
    } else {
        text = text.replace(/\s*(?:in|near)\s+\{city\}/g, "").replace(/\{city\}/g, "");
    }
    return tidy(text.replace(/\{category\}/g, values.category).replace(/\{business\}/g, values.business));
}

/** Lowercased, whitespace-collapsed form used only for duplicate detection. */
export function promptDedupeKey(text: string): string {
    return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Builds the suggestion set.
 *
 * Returns an empty array when there is no category: every template leans on it,
 * and a business with no GBP category has nothing for this to be derived from.
 * The caller reports that as "we could not suggest yet", which is true, rather
 * than substituting a guess.
 */
export function suggestPrompts(input: SuggestPromptsInput): PromptSuggestion[] {
    const category = input.category?.trim().toLowerCase();
    const business = input.businessName.trim();
    if (!category || !business) return [];

    const city = input.city?.trim() || null;
    const seen = new Set<string>();
    const suggestions: PromptSuggestion[] = [];

    for (const template of TEMPLATES) {
        const promptText = render(template.text, { category, city, business });
        const key = promptDedupeKey(promptText);
        // Without a city several templates collapse onto the same sentence.
        if (!promptText || seen.has(key)) continue;
        seen.add(key);
        suggestions.push({
            promptText,
            intent: template.intent,
            localeCity: city,
            clusterName: PROMPT_CLUSTERS[template.intent],
        });
    }

    return suggestions;
}

/** Share of suggestions naming the city or category — criterion #20's measure. */
export function cityOrCategoryCoverage(
    suggestions: PromptSuggestion[],
    input: { category: string | null; city: string | null }
): number {
    if (suggestions.length === 0) return 0;
    const category = input.category?.trim().toLowerCase() ?? null;
    const city = input.city?.trim().toLowerCase() ?? null;

    const matching = suggestions.filter((s) => {
        const text = s.promptText.toLowerCase();
        return (category !== null && text.includes(category)) || (city !== null && text.includes(city));
    }).length;

    return matching / suggestions.length;
}
