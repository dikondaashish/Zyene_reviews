import { getDefaultTagsForCategory } from "./category-tags";
import { CATEGORY_FALLBACK_EMOJI, LABEL_EMOJI_MAP } from "./tag-emoji-maps";
import { MAX_CUSTOM_TAG_LENGTH } from "./tags-for-ai";

export type ReviewTagItem = {
    emoji: string;
    label: string;
    /** Value from DB or defaults before display formatting */
    raw: string;
    /** Shown on pills and stored in tags_selected when selected */
    display: string;
};

/** Curated emojis for the settings chip editor picker */
export const TAG_EMOJI_PICKER = [
    "⭐",
    "👍",
    "👔",
    "🤝",
    "🧹",
    "📸",
    "🏠",
    "⚡",
    "💬",
    "💰",
    "✨",
    "👨‍💼",
    "👨‍🍳",
    "🎯",
    "⏰",
    "🏥",
    "🍽️",
    "🛠️",
    "📋",
    "❤️",
] as const;

function normalizeLabel(label: string): string {
    return label.trim().toLowerCase().replace(/\s+/g, " ");
}

function isLikelyEmojiToken(token: string): boolean {
    return token.length > 0 && !/^[a-zA-Z0-9]/.test(token);
}

/** Split stored tag into emoji prefix + label (category defaults use "emoji Label"). */
export function splitTagEmojiAndLabel(tag: string): { emoji: string; label: string } {
    const trimmed = tag.trim();
    if (!trimmed) return { emoji: "", label: "" };

    const spaceIdx = trimmed.indexOf(" ");
    if (spaceIdx === -1) {
        return isLikelyEmojiToken(trimmed) ? { emoji: trimmed, label: "" } : { emoji: "", label: trimmed };
    }

    const first = trimmed.slice(0, spaceIdx);
    const rest = trimmed.slice(spaceIdx + 1).trim();
    if (isLikelyEmojiToken(first) && rest) {
        return { emoji: first, label: rest };
    }

    return { emoji: "", label: trimmed };
}

function getEmojiForLabel(label: string, category: string): string {
    const key = normalizeLabel(label);
    if (!key) return CATEGORY_FALLBACK_EMOJI.other;

    if (LABEL_EMOJI_MAP[key]) return LABEL_EMOJI_MAP[key];

    const defaults = getDefaultTagsForCategory(category);
    for (const stored of defaults) {
        const parsed = splitTagEmojiAndLabel(stored);
        if (normalizeLabel(parsed.label) === key && parsed.emoji) {
            return parsed.emoji;
        }
    }

    const catKey = category.toLowerCase().trim();
    return CATEGORY_FALLBACK_EMOJI[catKey] ?? CATEGORY_FALLBACK_EMOJI.other;
}

export function formatTagForDisplay(tag: string, category: string): ReviewTagItem {
    const { emoji, label } = splitTagEmojiAndLabel(tag);
    const resolvedLabel = label || (emoji && !label ? "" : tag.trim());
    const finalLabel = resolvedLabel || tag.trim();
    const resolvedEmoji = emoji || getEmojiForLabel(finalLabel, category);
    const display = finalLabel ? `${resolvedEmoji} ${finalLabel}` : resolvedEmoji;

    return {
        emoji: resolvedEmoji,
        label: finalLabel,
        raw: tag,
        display,
    };
}

/** Tags shown on the public review flow (auto-icons for plain owner tags). */
export function resolveReviewFlowTags(
    customTags: string[] | undefined | null,
    category: string
): string[] {
    const raw =
        customTags && customTags.length > 0
            ? customTags
            : getDefaultTagsForCategory(category);
    return raw.map((t) => formatTagForDisplay(t, category).display);
}

export function parseTagsToItems(
    stored: string[] | undefined | null,
    category: string
): ReviewTagItem[] {
    const raw =
        stored && stored.length > 0 ? stored : getDefaultTagsForCategory(category);
    return raw.map((t) => formatTagForDisplay(t, category));
}

/** Normalize chip rows for save, preview, and public display (dedupe, cap length, drop empty). */
export function sanitizeTagItems(items: ReviewTagItem[]): ReviewTagItem[] {
    const seen = new Set<string>();
    const result: ReviewTagItem[] = [];

    for (const item of items) {
        const trimmedLabel = item.label.trim().replace(/\s+/g, " ");
        if (!trimmedLabel) continue;

        const dedupeKey = normalizeLabel(trimmedLabel);
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        const emoji = item.emoji?.trim() || "⭐";
        const maxLabelLen = Math.max(1, MAX_CUSTOM_TAG_LENGTH - emoji.length - 1);
        const cappedLabel = trimmedLabel.slice(0, maxLabelLen);
        const display = `${emoji} ${cappedLabel}`;

        result.push({
            emoji,
            label: cappedLabel,
            raw: item.raw,
            display,
        });
    }

    return result;
}

export function serializeTagItems(items: ReviewTagItem[]): string[] {
    return sanitizeTagItems(items).map((item) => item.display);
}

export function tagsMatchCategoryDefaults(items: ReviewTagItem[], category: string): boolean {
    const sanitized = sanitizeTagItems(items);
    const defaults = parseTagsToItems(null, category);
    if (sanitized.length !== defaults.length) return false;
    return sanitized.every(
        (item, i) =>
            normalizeLabel(item.label) === normalizeLabel(defaults[i].label) &&
            item.emoji === defaults[i].emoji
    );
}

/** Tags for live preview — mirrors what the public page will show. */
export function customTagsForPreview(
    items: ReviewTagItem[],
    category: string
): string[] | undefined {
    const saved = customTagsForSave(items, category);
    return saved ?? undefined;
}

/** Persist null when editor still matches category defaults (live category sync). */
export function customTagsForSave(
    items: ReviewTagItem[],
    category: string
): string[] | null {
    const sanitized = sanitizeTagItems(items);
    if (sanitized.length === 0) return null;
    if (tagsMatchCategoryDefaults(sanitized, category)) return null;
    return serializeTagItems(sanitized);
}
