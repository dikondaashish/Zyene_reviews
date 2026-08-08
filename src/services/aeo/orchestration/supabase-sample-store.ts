import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { isObservation } from "../engines/engine-types";
import type { AnswerEngineId, EngineSampleResult } from "../engines/engine-types";
import type { SampleStore } from "./ports";

type Admin = SupabaseClient<Database>;

/**
 * Persists one engine response.
 *
 * Writes NO brand-presence field, because the table has none. Presence is a
 * separate extraction pass into aeo_brand_mentions, carrying its own
 * extraction_model_id. That separation is the schema-level form of the rule the
 * pre-Phase-1 incident broke: nothing that writes raw engine output may also
 * assert whether the brand appeared in it.
 */
export class SupabaseSampleStore implements SampleStore {
    constructor(private readonly db: Admin) {}

    async persist(input: {
        runId: string;
        businessId: string;
        promptId: string;
        engineId: AnswerEngineId;
        attempt: number;
        result: EngineSampleResult;
        answerStoragePath: string | null;
    }): Promise<{ sampleId: string; alreadyPersisted: boolean }> {
        // A retried step must not create a second sample for the same unit.
        const existing = await this.db
            .from("aeo_samples")
            .select("id")
            .eq("run_id", input.runId)
            .eq("prompt_id", input.promptId)
            .eq("engine_id", input.engineId)
            .eq("attempt", input.attempt)
            .maybeSingle();

        if (existing.error) throw new Error(`sample lookup failed: ${existing.error.message}`);
        if (existing.data) return { sampleId: existing.data.id, alreadyPersisted: true };

        const { result } = input;

        const { data, error } = await this.db
            .from("aeo_samples")
            .insert({
                run_id: input.runId,
                business_id: input.businessId,
                prompt_id: input.promptId,
                engine_id: input.engineId,
                attempt: input.attempt,
                model_id: result.modelId,
                status: result.status,
                latency_ms: result.latencyMs,
                // Written by the orchestrator from a real engine call, so never
                // estimated. The column exists so a future heuristic source
                // cannot be mistaken for this one.
                is_estimated: false,
                // Only an answered sample may carry citation state; the table
                // rejects it on any other status.
                citations_availability: isObservation(result) ? result.citations.availability : null,
                no_answer_reason: result.status === "no_answer" ? result.reason : null,
                error_kind: result.status === "failed" ? result.error.kind : null,
                // E-8 pointer. NULL means no answer was retained — either there
                // was no prose to keep, or the upload failed — and readers must
                // show that as missing evidence, not as an empty answer.
                answer_storage_path: input.answerStoragePath,
            })
            .select("id")
            .single();

        if (error) throw new Error(`sample insert failed: ${error.message}`);
        return { sampleId: data.id, alreadyPersisted: false };
    }
}
