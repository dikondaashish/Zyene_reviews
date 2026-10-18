import { isSupportChatActionKey, type SupportChatActionKey, type SupportChatWidget } from "@/lib/support-chat/actions";
import type { SupportChatIntent } from "@/lib/support-chat/constants";
import { looksLikePromptInjection } from "@/lib/support-chat/guardrails";

/** Separates the streamed reply text from the trailing JSON metadata. */
export const META_MARKER = "<<<META>>>";

export interface ReplyMeta {
    intent: SupportChatIntent;
    /** False when the knowledge did not cover the question; feeds the weekly report. */
    answered: boolean;
    suggestions: string[];
    actions: SupportChatActionKey[];
    open: SupportChatWidget | null;
}

export const DEFAULT_REPLY_META: ReplyMeta = { intent: "answer", answered: true, suggestions: [], actions: [], open: null };

function cleanSuggestion(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const text = value.replace(/[<>[\]()*`]/g, "").replace(/\s+/g, " ").trim();
    if (text.length < 3 || text.length > 70 || /https?:|www\./i.test(text) || looksLikePromptInjection(text)) return null;
    return text;
}

/** Validates whatever the model put after the marker; anything unexpected falls back to defaults. */
export function parseReplyMeta(raw: string): ReplyMeta {
    const json = raw.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return DEFAULT_REPLY_META;
    try {
        const data = JSON.parse(json) as Record<string, unknown>;
        const intent: SupportChatIntent =
            data.intent === "handoff" || data.intent === "off_topic" ? data.intent : "answer";
        const suggestions = Array.isArray(data.suggestions)
            ? [...new Set(data.suggestions.map(cleanSuggestion).filter((s): s is string => !!s))].slice(0, 3)
            : [];
        const actions = Array.isArray(data.actions)
            ? [...new Set(data.actions.filter(isSupportChatActionKey))].slice(0, 2)
            : [];
        const open = data.open === "demo" || data.open === "reputation" ? data.open : null;
        return {
            intent,
            answered: data.answered !== false,
            suggestions: intent === "off_topic" ? [] : suggestions,
            actions: intent === "off_topic" ? [] : actions,
            open: intent === "off_topic" ? null : open,
        };
    } catch {
        return DEFAULT_REPLY_META;
    }
}
