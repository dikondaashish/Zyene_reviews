import type { PromptSuggestion } from "./suggest-prompts";

/**
 * A global launch may seed a business that has never chosen a prompt, but it
 * must not silently expand the paid workload of a business that already did.
 * The first templates are deliberately the strongest local-discovery queries
 * in suggest-prompts.ts, so taking this prefix is stable and explainable.
 */
export const DEFAULT_AUTO_ENROLL_PROMPT_COUNT = 5;

export function selectDefaultSuggestions(
    suggestions: PromptSuggestion[],
    activePromptCount: number
): PromptSuggestion[] {
    if (activePromptCount > 0) return [];
    return suggestions.slice(0, DEFAULT_AUTO_ENROLL_PROMPT_COUNT);
}
