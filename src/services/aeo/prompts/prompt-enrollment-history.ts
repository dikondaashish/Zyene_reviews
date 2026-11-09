import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/supabase/database.types";

type Admin = SupabaseClient<Database>;

/**
 * businesses column stamped by the mark_aeo_prompt_choice trigger
 * (20261109120000_aeo_prompt_choice_marker.sql) on the first owner-visible
 * prompt change: a manual/active insert, any on/off toggle, or any delete.
 * Inert suggestion inserts never stamp it, so the enrollment worker's own
 * half-finished writes do not count as a choice and an Inngest retry can finish.
 */
export const PROMPT_CHOICE_COLUMN = "aeo_prompt_choice_at";

type PromptState = { source: string; is_active: boolean; created_at: string; updated_at: string };

/** A suggestion row nobody has toggled: stored inactive and never updated since. */
export function isUntouchedSuggestion(prompt: PromptState): boolean {
    return (
        prompt.source === "suggested" &&
        !prompt.is_active &&
        prompt.created_at === prompt.updated_at
    );
}

/**
 * Worker-side gate for one business. The durable marker is the primary signal;
 * past runs and any prompt that is not an untouched suggestion are checked too
 * (defence in depth, and correct even where the marker trigger has not fired).
 * Clusters and inert suggestions are deliberately ignored: the worker writes
 * those itself before activating, so they cannot mean the owner chose.
 */
export async function hasPromptEnrollmentHistory(db: Admin, businessId: string): Promise<boolean> {
    const [marker, runs, prompts] = await Promise.all([
        db.from("businesses").select("id").eq("id", businessId).not(PROMPT_CHOICE_COLUMN, "is", null).limit(1),
        db.from("aeo_runs").select("id").eq("business_id", businessId).limit(1),
        db.from("aeo_prompts").select("source, is_active, created_at, updated_at").eq("business_id", businessId),
    ]);
    if (marker.error) throw new Error(`prompt choice marker read failed: ${marker.error.message}`);
    if (runs.error) throw new Error(`aeo_runs history read failed: ${runs.error.message}`);
    if (prompts.error) throw new Error(`aeo_prompts history read failed: ${prompts.error.message}`);

    if ((marker.data ?? []).length > 0 || (runs.data ?? []).length > 0) return true;
    return (prompts.data ?? []).some((prompt) => !isUntouchedSuggestion(prompt));
}
