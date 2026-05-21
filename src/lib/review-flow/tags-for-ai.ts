export const EVERYTHING_TAG = "👍 Everything";
export const CUSTOM_TAG_PREFIX = "custom:";

export const MAX_CUSTOM_TAG_CHIPS = 4;
export const MAX_CUSTOM_TAG_LENGTH = 80;

export type TagsForAiResult =
    | { mode: "everything" }
    | { mode: "specific"; presets: string[]; custom: string[] };

export function normalizeCustomTagInput(raw: string): string {
    return raw.trim().replace(/\s+/g, " ").slice(0, MAX_CUSTOM_TAG_LENGTH);
}

export function toCustomTagStored(value: string): string {
    return `${CUSTOM_TAG_PREFIX}${normalizeCustomTagInput(value)}`;
}

/** Combine preset selections and customer-entered chips for tracking / AI. */
export function buildTagsSelected(presetTags: string[], customTags: string[]): string[] {
    return [...presetTags, ...customTags.map((t) => toCustomTagStored(t))];
}

export function tagsForAi(selected: string[]): TagsForAiResult {
    if (selected.includes(EVERYTHING_TAG)) {
        return { mode: "everything" };
    }

    const custom = selected
        .filter((t) => t.startsWith(CUSTOM_TAG_PREFIX))
        .map((t) => t.slice(CUSTOM_TAG_PREFIX.length).trim())
        .filter(Boolean);

    const presets = selected
        .filter((t) => !t.startsWith(CUSTOM_TAG_PREFIX) && t !== EVERYTHING_TAG)
        .map((t) => t.replace(/^[^\s]+\s/, "").trim())
        .filter(Boolean);

    return { mode: "specific", presets, custom };
}

/** Cap tags sent to the model: custom phrases first (more specific), then presets. */
export function capTagsForPrompt(presets: string[], custom: string[], maxTotal = 6): { presets: string[]; custom: string[] } {
    const customCapped = custom.slice(0, MAX_CUSTOM_TAG_CHIPS);
    const presetSlots = Math.max(0, maxTotal - customCapped.length);
    return {
        custom: customCapped,
        presets: presets.slice(0, presetSlots),
    };
}

export function buildTagsPromptFragment(
    parsed: TagsForAiResult,
    rating: number
): string {
    if (parsed.mode === "everything") {
        return `The customer gave ${rating} stars and loved everything about their experience (all aspects of the visit).`;
    }

    const { presets, custom } = capTagsForPrompt(parsed.presets, parsed.custom);
    const parts: string[] = [`The customer gave ${rating} stars.`];

    if (custom.length > 0) {
        parts.push(
            `In their own words they especially appreciated: ${custom.join(", ")}. Weave these phrases in naturally and prefer them over generic labels.`
        );
    }
    if (presets.length > 0) {
        parts.push(`They also highlighted: ${presets.join(", ")}.`);
    }
    if (custom.length === 0 && presets.length === 0) {
        parts.push("They had a positive experience overall.");
    }

    return parts.join(" ");
}
