/**
 * Persists F4.2 suggestions and the F4.3 clusters they belong to.
 *
 * Idempotent by design: suggesting twice must not double a business's library.
 * Duplicate detection is on normalised prompt text across ALL of the business's
 * prompts, not just suggested ones — a user who already typed "best plumber in
 * Austin" should not be handed it back as a suggestion.
 *
 * Everything is written `is_active = false`. Nothing in this file can enrol a
 * prompt into a paid run.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/supabase/database.types";
import { promptDedupeKey, type PromptSuggestion } from "./suggest-prompts";

type Admin = SupabaseClient<Database>;

export type StoreSuggestionsResult = {
    inserted: number;
    skippedAsDuplicate: number;
    clusters: number;
};

/**
 * Resolves cluster names to ids, creating any that are missing.
 *
 * Upserted on the table's own `(business_id, name)` unique constraint rather
 * than read-then-insert: two concurrent suggestion runs would otherwise race
 * and one would fail on the constraint.
 */
async function ensureClusters(
    admin: Admin,
    businessId: string,
    names: string[]
): Promise<Map<string, string>> {
    if (names.length === 0) return new Map();

    const { error } = await admin
        .from("aeo_prompt_clusters")
        .upsert(
            names.map((name) => ({ business_id: businessId, name })),
            { onConflict: "business_id,name", ignoreDuplicates: true }
        );

    if (error) throw new Error(`cluster upsert failed: ${error.message}`);

    const { data, error: readError } = await admin
        .from("aeo_prompt_clusters")
        .select("id, name")
        .eq("business_id", businessId)
        .in("name", names);

    if (readError) throw new Error(`cluster read failed: ${readError.message}`);

    return new Map((data ?? []).map((row) => [row.name, row.id]));
}

export async function storeSuggestedPrompts(
    admin: Admin,
    businessId: string,
    suggestions: PromptSuggestion[]
): Promise<StoreSuggestionsResult> {
    if (suggestions.length === 0) return { inserted: 0, skippedAsDuplicate: 0, clusters: 0 };

    const { data: existingRows, error: existingError } = await admin
        .from("aeo_prompts")
        .select("prompt_text")
        .eq("business_id", businessId);

    if (existingError) throw new Error(`existing prompt read failed: ${existingError.message}`);

    const existing = new Set((existingRows ?? []).map((row) => promptDedupeKey(row.prompt_text)));
    const fresh = suggestions.filter((s) => !existing.has(promptDedupeKey(s.promptText)));

    if (fresh.length === 0) {
        return { inserted: 0, skippedAsDuplicate: suggestions.length, clusters: 0 };
    }

    const clusterNames = [...new Set(fresh.map((s) => s.clusterName))];
    const clusterIds = await ensureClusters(admin, businessId, clusterNames);

    const { error: insertError, count } = await admin.from("aeo_prompts").insert(
        fresh.map((s) => ({
            business_id: businessId,
            prompt_text: s.promptText,
            intent: s.intent,
            locale_city: s.localeCity,
            cluster_id: clusterIds.get(s.clusterName) ?? null,
            source: "suggested",
            is_active: false,
        })),
        { count: "exact" }
    );

    if (insertError) throw new Error(`suggestion insert failed: ${insertError.message}`);

    return {
        inserted: count ?? fresh.length,
        skippedAsDuplicate: suggestions.length - fresh.length,
        clusters: clusterIds.size,
    };
}
