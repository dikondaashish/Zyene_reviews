import { inngest } from "@/services/inngest/client";
import { engineRegistry } from "@/services/aeo/engines/engine-registry";
import { registerAeoAdapters } from "@/services/aeo/engines/register-adapters";
import type { AnswerEngineId } from "@/services/aeo/engines/engine-types";
import { dispatchUnit } from "@/services/aeo/orchestration/dispatch-unit";
import { getAeoStores } from "@/services/aeo/orchestration/store-factory";
import { extractSample } from "@/services/aeo/extraction/extract-sample";
import { SupabaseExtractionStore } from "@/services/aeo/extraction/supabase-extraction-store";
import { Phase2ExtractionStore } from "@/services/aeo/extraction/phase2-extraction-store";
import { analyzeMentions } from "@/services/aeo/analytics/mention-analyzer";
import { isObservation } from "@/services/aeo/engines/engine-types";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { loadAffordableTests } from "@/services/aeo/billing/aeo-balance";
import { isLiveSamplingEnabled } from "@/lib/features/aeo-surfaces";
import { logger } from "@/lib/logger";
import {
    announceRunCompletion,
    releaseUnitAndFinalize,
    type CompletionSteps,
} from "@/services/inngest/aeo/aeo-run-completion";

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
            limit: 1,
        },
        // Retries are safe by construction: the reservation is idempotent on
        // (runId, promptId, engineId, attempt) and a completed call step is
        // memoized rather than re-executed.
        retries: 3,
        // Retries exhausted: the unit will never store a sample, so release it
        // or the run waits on it forever. A no-op if the sample was stored.
        onFailure: async ({ event, step }) => {
            await releaseUnitAndFinalize(completionSteps(step), event.data.event.data, "dispatch_failed");
        },
    },
    { event: "aeo/dispatch.requested" },
    async ({ event, step }) => {
        const steps = completionSteps(step);
        const data = event.data;
        const engineId = data.engineId as AnswerEngineId;

        // The gate is memoized: env and registry state can differ between the
        // invocations Inngest replays, and a unit released here must never go
        // on to sample on a later replay (it would count twice).
        const gate = await step.run("check-dispatch-gate", async () => {
            if (!isLiveSamplingEnabled()) return "live_sampling_disabled" as const;
            // After the gate, never before: registering an adapter is what makes
            // an engine reachable.
            registerAeoAdapters();
            // Re-checked here, not just in the planner: an engine can be stood
            // down mid-run, and a child must never call one the registry withholds.
            return engineRegistry.resolveRunnable([engineId]).runnable[0] ? null : "engine_not_runnable" as const;
        });
        if (gate) {
            if (gate === "engine_not_runnable") {
                logger.warn({ engineId, runId: data.runId }, "AEO dispatch refused: engine not runnable");
            }
            await releaseUnitAndFinalize(steps, data, gate);
            return gate === "engine_not_runnable" ? { skipped: gate, engineId } : { skipped: gate };
        }

        registerAeoAdapters();
        const adapter = engineRegistry.resolveRunnable([engineId]).runnable[0];
        // Runnable when the gate ran, not on this replay: retry rather than
        // release, so the memoized decision stays the only one.
        if (!adapter) throw new Error(`AEO engine ${engineId} became unrunnable after the dispatch gate`);

        const stores = getAeoStores();

        // Re-checked per unit: the planner's cap cannot see a second run
        // (scheduled + manual) spending the same balance at the same time.
        const affordableTests = await step.run("check-balance", () =>
            loadAffordableTests(createAdminClient(), data.organizationId)
        );
        if (affordableTests === 0) {
            logger.info({ runId: data.runId, organizationId: data.organizationId }, "AEO dispatch paused: balance empty");
            await releaseUnitAndFinalize(steps, data, "insufficient_balance");
            return { skipped: "insufficient_balance" as const };
        }

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
                step: steps.run,
                adapter,
                reservations: stores.reservations,
                samples: stores.samples,
                answers: stores.answers,
                billing: stores.billing,
            }
        );

        // Quota deferred: no sample now or later for this unit.
        if (outcome.kind === "deferred") await releaseUnitAndFinalize(steps, data, "deferred");

        if (outcome.kind === "sampled" && outcome.duplicateRisk) {
            // The unavoidable case: a crash inside the call step after the request
            // went out. Logged loudly because the ledger's cost figure for this
            // reservation may now understate what the vendor actually charged.
            logger.error(
                { runId: data.runId, promptId: data.promptId, engineId, sampleId: outcome.sampleId },
                "AEO dispatch may have been billed twice - reconcile against the vendor invoice"
            );
        }

        // Extraction runs in its own step, AFTER the sample is durable and the
        // reservation is settled. It spends nothing and is re-runnable, so a
        // failure here must never cost a sample that was already paid for -
        // hence it is not folded into the dispatch steps.
        if (outcome.kind === "sampled") {
            const extracted = await step.run("extract-mentions", async () => {
                const extraction = new SupabaseExtractionStore(createAdminClient());
                const context = await extraction.loadBrandContext(data.businessId);
                const found = extractSample(outcome.result, context);
                const persisted = await extraction.persist(outcome.sampleId, data.businessId, found);
                return { found, persisted };
            });

            if (isObservation(outcome.result)) {
                const observedResult = outcome.result;
                const analyses = await step.run("analyze-mentions", () => analyzeMentions({
                    answerText: observedResult.answerText,
                    brandLabels: extracted.found.mentions.map((mention) => mention.label),
                }));
                await step.run("persist-phase2-extraction", () => new Phase2ExtractionStore(
                    createAdminClient()
                ).persist({
                    sampleId: outcome.sampleId,
                    businessId: data.businessId,
                    promptId: data.promptId,
                    engineId,
                    result: observedResult,
                    extraction: extracted.found,
                    analyses,
                }));
            }
        }

        if (outcome.kind === "sampled" && outcome.overrunUnits > 0) {
            logger.warn(
                { runId: data.runId, engineId, overrunUnits: outcome.overrunUnits },
                "AEO engine consumed more units than reserved; recorded cost is a floor"
            );
        }

        if (outcome.kind === "sampled") await announceRunCompletion(steps, data);

        return outcome;
    }
);

type InngestSteps = {
    run: (id: string, fn: () => Promise<unknown>) => Promise<unknown>;
    sendEvent: CompletionSteps["sendEvent"];
};

function completionSteps(step: InngestSteps): CompletionSteps {
    return {
        run: <T,>(id: string, fn: () => Promise<T>) => step.run(id, fn) as Promise<T>,
        sendEvent: (id, event) => step.sendEvent(id, event),
    };
}
