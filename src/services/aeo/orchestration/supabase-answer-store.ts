import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { logger } from "@/lib/logger";
import { isObservation } from "../engines/engine-types";
import type { AnswerStorePut } from "./ports";

type Admin = SupabaseClient<Database>;

export const AEO_ANSWER_BUCKET = "aeo-answers";

/** Bumped when the envelope's shape changes, so old objects stay readable. */
const ENVELOPE_VERSION = 1;

/**
 * Deterministic, and derived from the unit's identity rather than the sample's.
 *
 * The sample id does not exist until the row is inserted, so keying on it would
 * mean uploading before we have a name or inserting before we have a path. The
 * unit key is known up front and is the same on every replay, so a retried step
 * overwrites its own object instead of orphaning one.
 *
 * The organization id leads because the read policy matches on the first path
 * segment — see 20260807180000_aeo_answer_storage.sql.
 */
export function answerObjectPath(input: {
    organizationId: string;
    runId: string;
    promptId: string;
    engineId: string;
    attempt: number;
}): string {
    return `${input.organizationId}/${input.runId}/${input.promptId}__${input.engineId}__${input.attempt}.json`;
}

/**
 * E-8: the verbatim engine response, kept out-of-row.
 *
 * Stores the PROMPT alongside the answer. An answer on its own is not evidence —
 * "Gates and Arthur Bryant's" only means something next to the question that
 * produced it, and the prompt text can be edited or deactivated afterwards.
 * Locale travels with it for the same reason: the same question answers
 * differently in another metro.
 */
export class SupabaseAnswerStore {
    constructor(private readonly db: Admin) {}

    /**
     * Returns the stored path, or null when there is nothing to store or the
     * upload failed.
     *
     * Null is a real answer meaning "no stored evidence", and callers must render
     * it as such rather than as an empty answer. A failed upload must never fail
     * the sample: the measurement is what the vendor was paid for, and throwing
     * here would discard a paid observation to protect a copy of its prose.
     */
    async put(input: AnswerStorePut): Promise<string | null> {
        // Only an answered sample carries prose. `no_answer` keeps its reason and
        // `failed` its error kind in columns, where they are queryable; writing a
        // near-empty object for those would make a stored path stop meaning
        // "there is an answer here".
        if (!isObservation(input.result)) return null;

        const path = answerObjectPath(input);
        const envelope = {
            schemaVersion: ENVELOPE_VERSION,
            sampledAt: input.result.sampledAt,
            engineId: input.engineId,
            modelId: input.result.modelId,
            prompt: input.promptText,
            locale: input.locale,
            answerText: input.result.answerText,
            // Kept verbatim, tri-state included: "unavailable" and an empty
            // "present" list are different claims and must survive the round trip.
            citations: input.result.citations,
        };

        const { error } = await this.db.storage.from(AEO_ANSWER_BUCKET).upload(
            path,
            new Blob([JSON.stringify(envelope)], { type: "application/json" }),
            // Replay of a completed unit must land on the same bytes, not a
            // duplicate object or a 409.
            { contentType: "application/json", upsert: true }
        );

        if (error) {
            logger.error(
                { err: error, path, engineId: input.engineId },
                "[AEO] answer upload failed; sample will record no stored evidence"
            );
            return null;
        }
        return path;
    }
}
