import { inngest } from "@/services/inngest/client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { runGeoGrid } from "@/services/aeo/geo-grid/geo-grid-runner";
import { SupabaseGeoGridStore } from "@/services/aeo/geo-grid/supabase-geo-grid-store";
import { isLiveSamplingEnabled } from "@/lib/features/aeo-surfaces";
import { logger } from "@/lib/logger";
import { SupabaseReservationStore } from "@/services/aeo/orchestration/supabase-reservation-store";

/**
 * PRD-5 geo-grid worker.
 *
 * One function per grid rather than one per cell, unlike the sampling
 * dispatcher. The two look similar but bill differently: a sampling unit is one
 * independent charge, whereas a grid is only meaningful as a whole — 24 of 25
 * cells is not a heatmap. Fanning cells out as separate functions would let a
 * partial grid persist as if it were complete, and would spread one logical
 * spend across events nothing reconciles.
 *
 * The runner bounds its own concurrency internally, so the whole grid stays
 * under one rate-limit budget.
 */
export const aeoGeoGridWorker = inngest.createFunction(
    {
        id: "aeo-geo-grid-worker",
        // One grid at a time per business. A grid is size^2 billed requests, so
        // two overlapping runs for one business is a doubled bill for a result
        // that would immediately overwrite itself.
        concurrency: { key: "event.data.businessId", limit: 1 },
        // No automatic retries. Every attempt re-issues size^2 PAID requests,
        // and a transient failure already leaves usable partial data recorded
        // as `partial`. Retrying is a decision for a human looking at the cost,
        // not something to do silently three times.
        retries: 0,
    },
    { event: "aeo/geo-grid.requested" },
    async ({ event, step }) => {
        if (!isLiveSamplingEnabled()) {
            return { skipped: "live_sampling_disabled" as const };
        }

        const data = event.data;
        const admin = createAdminClient();
        const login = process.env.DATAFORSEO_LOGIN?.trim();
        const password = process.env.DATAFORSEO_PASSWORD?.trim();

        if (!login || !password) {
            logger.warn({ businessId: data.businessId }, "AEO geo-grid refused: DataForSEO not configured");
            await markRunFailed(data.runId, "DataForSEO is not configured.");
            return { skipped: "dataforseo_not_configured" as const };
        }

        const reservations = new SupabaseReservationStore(admin);
        const reservation = await step.run("reserve-grid", () =>
            reservations.reserve({
                idempotencyKey: `geo-grid:${data.runId}`,
                organizationId: data.organizationId,
                engineId: "google_serp",
                usageDate: new Date().toISOString().slice(0, 10),
                requestedUnits: data.gridSize * data.gridSize,
                freePerDay: 0,
                overageAuthorised: false,
            })
        );
        if (reservation.kind === "deferred") {
            await markRunFailed(data.runId, "Geo-grid quota could not be reserved.");
            return { skipped: "quota_deferred" as const };
        }
        if (reservation.kind === "existing" && reservation.alreadySettled) {
            return { skipped: "already_settled" as const };
        }

        const outcome = await step.run("run-grid", async () => {
            await reservations.markDispatched(reservation.reservationId, new Date().toISOString());
            return runGeoGrid(
                {
                    centerLat: data.centerLat,
                    centerLng: data.centerLng,
                    size: data.gridSize,
                    spacingMeters: data.spacingMeters,
                    keyword: data.keyword,
                    languageCode: data.languageCode,
                    aliases: await loadBusinessAliases(data.businessId),
                    placeId: data.placeId,
                },
                { login, password }
            );
        });

        const persisted = await step.run("persist-grid", async () => {
            const store = new SupabaseGeoGridStore(admin);
            const written = await store.complete({
                runId: data.runId,
                businessId: data.businessId,
                outcome,
            });

            return {
                runId: written.runId,
                points: written.points,
                status: outcome.status,
                averageRank: outcome.averageRank,
                coveragePercent: outcome.coveragePercent,
                failedCells: outcome.failedCells,
                billedRequests: outcome.billedRequests,
                costMicroUsd: outcome.costMicroUsd,
            };
        });

        await step.run("settle-grid", () =>
            reservations.settle(reservation.reservationId, {
                settledUnits: Math.min(outcome.billedRequests, reservation.grantedUnits),
                overrunUnits: Math.max(0, outcome.billedRequests - reservation.grantedUnits),
                billableUnits: outcome.costMicroUsd > 0 ? outcome.billedRequests : 0,
                costMicroUsd: outcome.costMicroUsd,
                at: new Date().toISOString(),
            })
        );

        if (persisted.failedCells > 0) {
            logger.warn(
                { businessId: data.businessId, runId: persisted.runId, failedCells: persisted.failedCells },
                "AEO geo-grid completed with unsearched cells — coverage excludes them"
            );
        }
        if (outcome.costMicroUsd > 0) {
            const variance = Math.abs(outcome.costMicroUsd - data.estimatedCostMicroUsd)
                / data.estimatedCostMicroUsd;
            if (variance > 0.05) {
                logger.warn(
                    { runId: data.runId, estimated: data.estimatedCostMicroUsd, actual: outcome.costMicroUsd },
                    "AEO geo-grid provider cost varied by more than five percent"
                );
            }
        }

        return persisted;
    }
);

/**
 * Names the business may be listed under in a local pack.
 *
 * Only the business's own name today. Google frequently lists a longer trading
 * name, which findLocalRank handles by matching containment in either
 * direction — so a single canonical name is usually enough.
 */
async function loadBusinessAliases(businessId: string): Promise<string[]> {
    const { data } = await createAdminClient()
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();

    return data?.name ? [data.name] : [];
}

async function markRunFailed(runId: string, message: string): Promise<void> {
    await createAdminClient()
        .from("aeo_geo_grid_runs")
        .update({ status: "failed", error_message: message, completed_at: new Date().toISOString() })
        .eq("id", runId);
}
