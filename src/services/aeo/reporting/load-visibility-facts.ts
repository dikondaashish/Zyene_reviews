import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import type { AnswerEngineId } from "../engines/engine-types";
import type { SampleFact } from "./visibility-metrics";

type Db = SupabaseClient<Database>;

/** Days of history a dashboard rate is computed over. */
export const VISIBILITY_WINDOW_DAYS = 30;

export type PromptFact = {
    /**
     * Null once the prompt row is deleted — the FK is ON DELETE SET NULL, so the
     * observation outlives the question by design. The stored answer envelope
     * still holds the prompt text for these (E-8).
     */
    promptId: string | null;
    promptText: string;
    engineId: AnswerEngineId;
    status: SampleFact["status"];
    ownBrandNamed: boolean;
    sampledAt: string;
    answerStoragePath: string | null;
};

export type VisibilityFacts = {
    facts: SampleFact[];
    /** Same samples, keyed for the per-prompt table and the CSV export. */
    perPrompt: PromptFact[];
    windowStart: string;
};

/**
 * Reads the samples a visibility number is computed from.
 *
 * Runs over a WINDOW rather than the latest run. One run of five prompts gives
 * five observations per engine, which is barely over the QA #37 floor and would
 * make every tile flicker between suppressed and reported week to week. The
 * window is also what makes a rate mean "how often", rather than "what happened
 * on Tuesday".
 */
export async function loadVisibilityFacts(
    db: Db,
    businessId: string,
    windowDays = VISIBILITY_WINDOW_DAYS
): Promise<VisibilityFacts> {
    const windowStart = new Date(Date.now() - windowDays * 86_400_000).toISOString();

    const { data: samples, error } = await db
        .from("aeo_samples")
        .select("id, engine_id, status, model_id, is_estimated, answer_storage_path, sampled_at, prompt_id")
        .eq("business_id", businessId)
        .gte("sampled_at", windowStart)
        .order("sampled_at", { ascending: false });

    if (error) throw new Error(`loadVisibilityFacts failed: ${error.message}`);
    const rows = samples ?? [];
    if (rows.length === 0) return { facts: [], perPrompt: [], windowStart };

    /*
     * "Named" means named in prose. A cited-only mention is excluded on purpose:
     * being a SOURCE an engine consulted is not being a business it recommended,
     * and merging the two inflates visibility with links the reader never saw as
     * a recommendation.
     */
    const { data: mentions, error: mentionError } = await db
        .from("aeo_brand_mentions")
        .select("sample_id")
        .eq("business_id", businessId)
        .eq("brand_kind", "own")
        .eq("cited_only", false)
        .in("sample_id", rows.map((r) => r.id));

    if (mentionError) throw new Error(`loadVisibilityFacts mentions failed: ${mentionError.message}`);
    const named = new Set((mentions ?? []).map((m) => m.sample_id));

    const promptIds = [...new Set(rows.map((r) => r.prompt_id).filter((id): id is string => id !== null))];
    const { data: prompts } = promptIds.length
        ? await db.from("aeo_prompts").select("id, prompt_text").in("id", promptIds)
        : { data: [] };
    const promptText = new Map((prompts ?? []).map((p) => [p.id, p.prompt_text]));

    const facts: SampleFact[] = [];
    const perPrompt: PromptFact[] = [];

    for (const row of rows) {
        const status = row.status as SampleFact["status"];
        // Only an answered sample can be said to name or not name the brand. A
        // failure carries no answer to read, so it never counts either way.
        const ownBrandNamed = status === "ok" && named.has(row.id);
        const engineId = row.engine_id as AnswerEngineId;

        facts.push({
            engineId,
            status,
            modelId: row.model_id,
            ownBrandNamed,
            isEstimated: row.is_estimated,
            hasStoredAnswer: row.answer_storage_path !== null,
            sampledAt: row.sampled_at,
        });

        perPrompt.push({
            promptId: row.prompt_id,
            // A prompt deleted since sampling leaves its samples valid but
            // unlabelled; saying so beats dropping the row from the table, which
            // would quietly shrink the denominator behind a published rate.
            promptText: (row.prompt_id ? promptText.get(row.prompt_id) : null) ?? "(prompt removed)",
            engineId,
            status,
            ownBrandNamed,
            sampledAt: row.sampled_at,
            answerStoragePath: row.answer_storage_path,
        });
    }

    return { facts, perPrompt, windowStart };
}
