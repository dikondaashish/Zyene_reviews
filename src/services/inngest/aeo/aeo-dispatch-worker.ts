import { inngest } from "@/services/inngest/client";
import { engineRegistry } from "@/services/aeo/engines/engine-registry";
import { registerAeoAdapters } from "@/services/aeo/engines/register-adapters";
import type { AnswerEngineId } from "@/services/aeo/engines/engine-types";
import { dispatchUnit } from "@/services/aeo/orchestration/dispatch-unit";
import { getAeoStores } from "@/services/aeo/orchestration/store-factory";
import { extractSample } from "@/services/aeo/extraction/extract-sample";
import { SupabaseExtractionStore } from "@/services/aeo/extraction/supabase-extraction-store";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { isLiveSamplingEnabled } from "@/lib/features/aeo-surfaces";
import { logger } from "@/lib/logger";

/**
 * E-7 child: one (prompt x engine x attempt).
 *
 * One function per unit rather than one function looping the whole run, so a
 * retry re-runs only the unit that failed. With a paid engine the alternative
 * means re-paying for every unit that already succeeded.
 *
 * The step boundaries that make a crash survivable live in dispatchUnit; this
 * function only supplies Inngest's real `step.run` in place of the fake one the
 * crash tests use.
 */
export const aeoDispatchWorker = inngest.createFunction(
    {
        id: "aeo-dispatch-worker",
        /**
         * Serialize per (org, engine): the reservation RPC takes an advisory lock
         * on exactly that grain, so unbounded parallelism would just queue inside
         * Postgres while holding connections. This keeps the contention in
         * Inngest, where waiting is free.
         */
        concurrency: {
            key: "event.data.organizationId + '-' + event.data.engineId",
            limit: 4,
        },
        // Retries are safe by construction: the reservation is idempotent on
        // (runId, promptId, engineId, attempt) and a completed call step is
        // memoized rather than re-executed.
        retries: 3,
    },
    { event: "aeo/dispatch.requested" },
    async ({ event, step }) => {
        if (!isLiveSamplingEnabled()) {
            return { skipped: "live_sampling_disabled" as const };
        }

        // After the gate, never before: registering an adapter is what makes an
        // engine reachable, and there is no reason to do it in a process that
        // has just declined to sample.
        registerAeoAdapters();

        const data = event.data;
        const engineId = data.engineId as AnswerEngineId;

        // Re-checked here, not just in the planner. Events can be replayed by
        // hand, and an engine can be stood down mid-run; a child must never call
        // an engine the registry would currently withhold.
        const { runnable } = engineRegistry.resolveRunnable([engineId]);
        const adapter = runnable[0];
        if (!adapter) {
            logger.warn({ engineId, runId: data.runId }, "AEO dispatch refused: engine not runnable");
            return { skipped: "engine_not_runnable" as const, engineId };
        }

        const stores = getAeoStores();

        const outcome = await dispatchUnit(
            {
                runId: data.runId,
                businessId: data.businessId,
                organizationId: data.organizationId,
                promptId: data.promptId,
                promptText: data.promptText,
                engineId,
                attempt: data.attempt,
                locale: data.locale,
                usageDate: data.usageDate,
                overageAuthorised: data.overageAuthorised,
                requestedUnits: data.requestedUnits,
            },
            {
                step: <T,>(id: string, fn: () => Promise<T>) => step.run(id, fn) as Promise<T>,
                adapter,
                reservations: stores.reservations,
                samples: stores.samples,
                answers: stores.answers,
            }
        );

        if (outcome.kind === "sampled" && outcome.duplicateRisk) {
            // The unavoidable case: a crash inside the call step after the request
            // went out. Logged loudly because the ledger's cost figure for this
            // reservation may now understate what the vendor actually charged.
            logger.error(
                { runId: data.runId, promptId: data.promptId, engineId, sampleId: outcome.sampleId },
                "AEO dispatch may have been billed twice — reconcile against the vendor invoice"
            );
        }

        // Extraction runs in its own step, AFTER the sample is durable and the
        // reservation is settled. It spends nothing and is re-runnable, so a
        // failure here must never cost a sample that was already paid for —
        // hence it is not folded into the dispatch steps.
        if (outcome.kind === "sampled") {
            await step.run("extract-mentions", async () => {
                const extraction = new SupabaseExtractionStore(createAdminClient());
                const context = await extraction.loadBrandContext(data.businessId);
                const found = extractSample(outcome.result, context);
                return extraction.persist(outcome.sampleId, data.businessId, found);
            });
        }

        if (outcome.kind === "sampled" && outcome.overrunUnits > 0) {
            logger.warn(
                { runId: data.runId, engineId, overrunUnits: outcome.overrunUnits },
                "AEO engine consumed more units than reserved; recorded cost is a floor"
            );
        }

        return outcome;
    }
);
