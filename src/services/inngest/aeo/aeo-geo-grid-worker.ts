import { inngest } from "@/services/inngest/client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { runGeoGrid } from "@/services/aeo/geo-grid/geo-grid-runner";
import { SupabaseGeoGridStore } from "@/services/aeo/geo-grid/supabase-geo-grid-store";
import { isLiveSamplingEnabled } from "@/lib/features/aeo-surfaces";
import { logger } from "@/lib/logger";

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
        const login = process.env.DATAFORSEO_LOGIN?.trim();
        const password = process.env.DATAFORSEO_PASSWORD?.trim();

        if (!login || !password) {
            logger.warn({ businessId: data.businessId }, "AEO geo-grid refused: DataForSEO not configured");
            return { skipped: "dataforseo_not_configured" as const };
        }

        // The whole grid is one step. Splitting search from persist would mean a
        // crash after searching had paid for every cell and stored none of it.
        const persisted = await step.run("run-and-persist-grid", async () => {
            const outcome = await runGeoGrid(
                {
                    centerLat: data.centerLat,
                    centerLng: data.centerLng,
                    size: data.gridSize,
                    spacingMeters: data.spacingMeters,
                    keyword: data.keyword,
                    languageCode: data.languageCode,
                    aliases: await loadBusinessAliases(data.businessId),
                },
                { login, password }
            );

            const store = new SupabaseGeoGridStore(createAdminClient());
            const written = await store.persist({
                businessId: data.businessId,
                keyword: data.keyword,
                gridSize: data.gridSize,
                spacingMeters: data.spacingMeters,
                centerLat: data.centerLat,
                centerLng: data.centerLng,
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

        if (persisted.failedCells > 0) {
            logger.warn(
                { businessId: data.businessId, runId: persisted.runId, failedCells: persisted.failedCells },
                "AEO geo-grid completed with unsearched cells — coverage excludes them"
            );
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
