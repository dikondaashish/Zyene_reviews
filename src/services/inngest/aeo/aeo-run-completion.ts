import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { createAdminClient } from "@/lib/db/supabase/admin";
import type { StepRunner } from "@/services/aeo/orchestration/ports";
import type { AeoDispatchRequestedEvent, AeoPhase3RefreshRequestedEvent } from "@/services/inngest/aeo/aeo-events";
import { deliverOutboundEvent } from "@/services/aeo/integrations/deliver-outbound-event";
import { logger } from "@/lib/logger";

/**
 * Run completion for E-7 children.
 *
 * A run finalizes when samples + skipped units reach expected_samples (see
 * 20261108130000_aeo_run_skipped_units.sql). A child that ends WITHOUT a sample
 * - balance gone, quota deferred, engine stood down, retries exhausted - must
 * release its unit, or the run waits forever for a sample that never comes and
 * aeo.run.completed / the phase-3 refresh never fire.
 */

type Admin = SupabaseClient<Database>;
type DispatchData = AeoDispatchRequestedEvent["data"];

export type UnitReleaseReason =
    | "insufficient_balance"
    | "deferred"
    | "engine_not_runnable"
    | "live_sampling_disabled"
    | "dispatch_failed";

export type CompletionSteps = {
    run: StepRunner;
    sendEvent: (stepId: string, event: { name: "aeo/phase3.refresh.requested";
        data: AeoPhase3RefreshRequestedEvent["data"] }) => Promise<unknown>;
};

/** Idempotent per unit, and a no-op for a unit that did store a sample. */
export async function releaseRunUnit(db: Admin, data: DispatchData, reason: UnitReleaseReason) {
    const { data: rows, error } = await db.rpc("aeo_release_run_unit" as never, {
        p_run_id: data.runId,
        p_prompt_id: data.promptId,
        p_engine_id: data.engineId,
        p_attempt: data.attempt,
        p_reason: reason,
    } as never);
    if (error) throw new Error(`aeo_release_run_unit failed: ${(error as { message: string }).message}`);
    const row = (Array.isArray(rows) ? rows[0] : rows) as { released?: boolean; finalized?: boolean } | null;
    return { released: row?.released === true, finalized: row?.finalized === true };
}

/** Delivers aeo.run.completed and queues the phase-3 refresh once the run is terminal. */
export async function announceRunCompletion(steps: CompletionSteps, data: DispatchData) {
    const completion = await steps.run("deliver-run-completed-webhooks", async () => {
        const admin = createAdminClient();
        const runResult = await admin.from("aeo_runs" as never)
            .select("id, status, completed_at, completed_samples, expected_samples" as never)
            .eq("id" as never, data.runId).maybeSingle();
        const run = runResult.data as unknown as { id: string; status: string; completed_at: string | null;
            completed_samples: number; expected_samples: number } | null;
        if (!run?.completed_at || !["success", "partial", "failed"].includes(run.status)) {
            return { completed: false, delivered: 0, failed: 0 };
        }
        const delivery = await deliverOutboundEvent(admin, {
            organizationId: data.organizationId, businessId: data.businessId,
            event: "aeo.run.completed", sourceId: run.id,
            data: { id: run.id, status: run.status, completedAt: run.completed_at,
                completedSamples: run.completed_samples, expectedSamples: run.expected_samples },
        });
        return { completed: true, ...delivery };
    });
    if (completion.completed) {
        await steps.sendEvent("queue-phase3-refresh", { name: "aeo/phase3.refresh.requested", data: {
            businessId: data.businessId, organizationId: data.organizationId, trigger: "run_completed" as const,
        } });
    }
    return completion;
}

/**
 * Releases this child's unit and, when that release was the one that closed
 * the run, announces completion exactly as a final sample would.
 */
export async function releaseUnitAndFinalize(steps: CompletionSteps, data: DispatchData, reason: UnitReleaseReason) {
    const release = await steps.run("release-run-unit", () => releaseRunUnit(createAdminClient(), data, reason));
    if (release.released) {
        logger.info({ runId: data.runId, promptId: data.promptId, engineId: data.engineId, reason,
            finalized: release.finalized }, "AEO run unit released without a sample");
    }
    if (release.finalized) await announceRunCompletion(steps, data);
    return release;
}
