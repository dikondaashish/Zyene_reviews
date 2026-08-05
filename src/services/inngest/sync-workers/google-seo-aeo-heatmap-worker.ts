import { inngest } from "../client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import {
    areEstimatedAeoSurfacesEnabled,
    DISABLED_RUN_MESSAGE,
    DISABLED_RUN_STATUS,
    ESTIMATED_METHOD,
} from "@/lib/features/aeo-surfaces";

/**
 * Estimated local heatmap run.
 *
 * This does NOT query a SERP or Maps provider. Cell labels are string-built from
 * the business city and ranks are derived from the review rating, so there are no
 * real coordinates behind them. Rows persist with `is_estimated = true`.
 * Disabled by default — see `@/lib/features/aeo-surfaces`.
 *
 * Phase 1 replaces this with coordinate-level Maps sampling (PRD-5), which needs
 * lat/lng columns this table does not yet have.
 */
export const googleSeoAeoHeatmapWorker = inngest.createFunction(
    {
        id: "google-seo-aeo-heatmap-worker",
        name: "Google SEO/AEO Heatmap (estimated)",
        concurrency: { limit: 2 },
    },
    { event: "google-seo-aeo/heatmap.run" },
    async ({ event, step }) => {
        const admin = createAdminClient();
        const { businessId, keyword } = event.data;

        if (!areEstimatedAeoSurfacesEnabled()) {
            await step.run("record-disabled-run", async () => {
                await admin.from("google_seo_heatmap_runs").insert({
                    business_id: businessId,
                    keyword,
                    status: DISABLED_RUN_STATUS,
                    error_message: DISABLED_RUN_MESSAGE,
                    completed_at: new Date().toISOString(),
                    is_estimated: true,
                    method: ESTIMATED_METHOD.heatmap,
                });
            });
            return { success: true, skipped: true, reason: "estimated_surfaces_disabled" };
        }

        let runId: string | null = null;

        try {
            const run = await step.run("create-heatmap-run", async () => {
                const { data, error } = await admin
                    .from("google_seo_heatmap_runs")
                    .insert({
                        business_id: businessId,
                        keyword,
                        status: "running",
                        is_estimated: true,
                        method: ESTIMATED_METHOD.heatmap,
                    })
                    .select("id")
                    .single();
                if (error || !data?.id) throw new Error(error?.message || "Failed to create heatmap run");
                return data as { id: string };
            });
            runId = run.id;

            const { data: business } = await admin
                .from("businesses")
                .select("average_rating, city, state")
                .eq("id", businessId)
                .maybeSingle();

            const cityVal = business?.city || "Local Area";
            const stateVal = business?.state ? `, ${business.state}` : "";
            const labels = [
                `${cityVal}${stateVal}`,
                `North ${cityVal}${stateVal}`,
                `Downtown ${cityVal}${stateVal}`,
                `East ${cityVal}${stateVal}`,
                `West ${cityVal}${stateVal}`,
                `South ${cityVal}${stateVal}`,
            ];
            const base = Math.max(1, Math.min(20, Math.round(21 - Number(business?.average_rating || 4))));

            await step.run("store-heatmap-cells", async () => {
                const rows = labels.map((label, idx) => ({
                    run_id: run.id,
                    business_id: businessId,
                    cell_label: label,
                    rank_position: Math.max(1, base + idx - 2),
                    // No fabricated percentage: the heuristic has no visibility signal.
                    visibility_score: 0,
                    is_estimated: true,
                    method: ESTIMATED_METHOD.heatmap,
                }));
                const { error } = await admin.from("google_seo_heatmap_cells").insert(rows);
                if (error) throw new Error(error.message);
            });

            await step.run("complete-heatmap-run", async () => {
                await admin
                    .from("google_seo_heatmap_runs")
                    .update({ status: "success", completed_at: new Date().toISOString(), error_message: null })
                    .eq("id", run.id);
            });

            return { success: true, runId: run.id, cells: labels.length };
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            if (runId) {
                await step.run("fail-heatmap-run", async () => {
                    await admin
                        .from("google_seo_heatmap_runs")
                        .update({ status: "failed", error_message: msg, completed_at: new Date().toISOString() })
                        .eq("id", runId as string);
                });
            }
            throw e;
        }
    }
);
