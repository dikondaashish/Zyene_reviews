import { inngest } from "@/services/inngest/client";
import { engineRegistry } from "@/services/aeo/engines/engine-registry";
import { registerAeoAdapters } from "@/services/aeo/engines/register-adapters";
import type { AnswerEngineId } from "@/services/aeo/engines/engine-types";
import { planRun } from "@/services/aeo/orchestration/run-plan";
import { getAeoStores } from "@/services/aeo/orchestration/store-factory";
import { isLiveSamplingEnabled } from "@/lib/features/aeo-surfaces";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { loadAffordableTests } from "@/services/aeo/billing/aeo-balance";
import { logger } from "@/lib/logger";

/**
 * E-7 parent: plan a run and fan out one child per unit of work.
 *
 * This function calls no engine and spends nothing. It resolves which engines
 * may run, loads active prompts, projects the day's budget, records the run,
 * and emits events. Keeping spend entirely in the children means a planning
 * failure cannot half-charge anyone.
 */

const DEFAULT_ENGINES: AnswerEngineId[] = ["gemini"];

export const aeoRunPlanner = inngest.createFunction(
    {
        id: "aeo-run-planner",
        // One in-flight run per business. A second planner for the same business
        // would fan out a duplicate set of units, and each would reserve under a
        // different runId - so the idempotency key would not catch it.
        concurrency: { key: "event.data.businessId", limit: 1 },
        retries: 2,
    },
    { event: "aeo/run.requested" },
    async ({ event, step }) => {
        const { businessId, organizationId, trigger } = event.data;

        // Checked before any work. This gate governs spending, not display, so
        // it fails closed on anything but a literal "true".
        if (!isLiveSamplingEnabled()) {
            return { skipped: "live_sampling_disabled" as const };
        }

        // After the gate, never before: registering an adapter is what makes an
        // engine reachable, and there is no reason to do it in a process that
        // has just declined to sample.
        registerAeoAdapters();

        const stores = getAeoStores();
        const usageDate = new Date().toISOString().slice(0, 10);

        const plan = await step.run("plan-run", async () => {
            const [prompts, consumedByEngine] = await Promise.all([
                stores.runs.loadActivePrompts(businessId),
                stores.runs.consumedTodayByEngine(organizationId, usageDate),
            ]);

            return planRun(
                {
                    // Placeholder id: planning is pure and does not need the row to
                    // exist yet. The real runId is stamped onto each dispatch below,
                    // once the run is recorded.
                    runId: "",
                    businessId,
                    organizationId,
                    usageDate,
                    prompts,
                    requestedEngines: (event.data.engineIds as AnswerEngineId[]) ?? DEFAULT_ENGINES,
                    attemptsPerPrompt: event.data.attemptsPerPrompt,
                    overageAuthorised: event.data.overageAuthorised,
                    consumedByEngine,
                },
                engineRegistry
            );
        });

        if (plan.withheld.length > 0) {
            logger.info(
                { businessId, withheld: plan.withheld.map((w) => `${w.descriptor.id}:${w.state}`) },
                "AEO engines withheld from run"
            );
        }

        // Prepaid balance: never start more tests than the org has paid for.
        // null = metered billing is off, so nothing is counted.
        const affordableTests = await step.run("check-balance", () =>
            loadAffordableTests(createAdminClient(), organizationId)
        );
        const dispatches = affordableTests === null ? plan.dispatches : plan.dispatches.slice(0, affordableTests);
        const emptyReason =
            dispatches.length === 0 && plan.dispatches.length > 0 ? "insufficient_balance" : plan.emptyReason;

        // A run that dispatches nothing is still recorded. Silently doing nothing
        // is indistinguishable from a broken scheduler when someone asks later
        // why a business has no data.
        if (dispatches.length === 0) {
            const { runId } = await step.run("create-empty-run", () =>
                stores.runs.createRun({
                    businessId,
                    trigger,
                    scheduledFor: event.data.scheduledFor ?? null,
                    expectedSamples: 0,
                })
            );
            await step.run("close-empty-run", () =>
                stores.runs.completeRun(runId, {
                    status:
                        emptyReason === "budget_exhausted" || emptyReason === "insufficient_balance"
                            ? "deferred"
                            : "failed",
                    errorMessage: emptyReason,
                    at: new Date().toISOString(),
                })
            );
            return { runId, dispatched: 0, reason: emptyReason };
        }

        const { runId } = await step.run("create-run", () =>
            stores.runs.createRun({
                businessId,
                trigger,
                scheduledFor: event.data.scheduledFor ?? null,
                expectedSamples: dispatches.length,
            })
        );

        // Emitted after the run row exists, so no child can reference a runId
        // that was never written.
        await step.sendEvent(
            "fan-out",
            dispatches.map((d) => ({
                name: "aeo/dispatch.requested" as const,
                data: { ...d, runId },
            }))
        );

        return {
            runId,
            dispatched: dispatches.length,
            withheldForBalance: plan.dispatches.length - dispatches.length,
            projectedDeferredUnits: plan.projectedDeferredUnits,
            withheld: plan.withheld.map((w) => w.descriptor.id),
        };
    }
);
