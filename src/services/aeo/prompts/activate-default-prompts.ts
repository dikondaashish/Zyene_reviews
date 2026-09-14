import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/supabase/database.types";
import { promptDedupeKey, type PromptSuggestion } from "./suggest-prompts";

type Admin = SupabaseClient<Database>;

export type DefaultPromptActivation = {
    activated: number;
    skipped: number;
};

/**
 * Activates a bounded, deterministic selection after suggestion storage.
 * A second active-prompt check and the database trigger protect a customer's
 * existing choices if they edit their library while this worker is running.
 */
export async function activateDefaultPrompts(
    db: Admin,
    businessId: string,
    defaults: PromptSuggestion[]
): Promise<DefaultPromptActivation> {
    if (defaults.length === 0) return { activated: 0, skipped: 0 };

    const { data: prompts, error } = await db
        .from("aeo_prompts")
        .select("id, prompt_text, is_active")
        .eq("business_id", businessId);

    if (error) throw new Error(`default prompt read failed: ${error.message}`);
    if ((prompts ?? []).some((prompt) => prompt.is_active)) {
        return { activated: 0, skipped: defaults.length };
    }

    const promptByKey = new Map((prompts ?? []).map((prompt) => [promptDedupeKey(prompt.prompt_text), prompt]));
    let activated = 0;

    for (const suggestion of defaults) {
        const prompt = promptByKey.get(promptDedupeKey(suggestion.promptText));
        if (!prompt || prompt.is_active) continue;

        const { error: updateError } = await db
            .from("aeo_prompts")
            .update({ is_active: true, updated_at: new Date().toISOString() })
            .eq("id", prompt.id)
            .eq("is_active", false);

        if (updateError) {
            if (updateError.message.includes("AEO_PROMPT_LIMIT_REACHED")) break;
            throw new Error(`default prompt activation failed: ${updateError.message}`);
        }
        activated += 1;
    }

    return { activated, skipped: defaults.length - activated };
}
