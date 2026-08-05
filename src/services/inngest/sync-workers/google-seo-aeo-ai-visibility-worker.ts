import { inngest } from "../client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import {
    areEstimatedAeoSurfacesEnabled,
    DISABLED_RUN_MESSAGE,
    DISABLED_RUN_STATUS,
    ESTIMATED_METHOD,
} from "@/lib/features/aeo-surfaces";

const ESTIMATED_MODELS = ["ChatGPT", "Claude", "Gemini", "Grok", "Llama", "Perplexity"];

/**
 * Estimated AI-visibility run.
 *
 * This does NOT query any answer engine. It compares the business rating against
 * tracked competitor ratings and marks a likely presence. Rows persist with
 * `is_estimated = true` so they can never be mixed into measured Phase 1 metrics.
 * Disabled by default — see `@/lib/features/aeo-surfaces`.
 */
export const googleSeoAeoAiVisibilityWorker = inngest.createFunction(
    {
        id: "google-seo-aeo-ai-visibility-worker",
        name: "Google SEO/AEO AI Visibility (estimated)",
        concurrency: { limit: 2 },
    },
    { event: "google-seo-aeo/ai-visibility.run" },
    async ({ event, step }) => {
        const admin = createAdminClient();
        const { businessId, query } = event.data;

        if (!areEstimatedAeoSurfacesEnabled()) {
            await step.run("record-disabled-run", async () => {
                await admin.from("google_seo_ai_visibility_runs").insert({
                    business_id: businessId,
                    query,
                    status: DISABLED_RUN_STATUS,
                    error_message: DISABLED_RUN_MESSAGE,
                    completed_at: new Date().toISOString(),
                    is_estimated: true,
                    method: ESTIMATED_METHOD.aiVisibility,
                });
            });
            return { success: true, skipped: true, reason: "estimated_surfaces_disabled" };
        }

        let runId: string | null = null;

        try {
            const run = await step.run("create-ai-visibility-run", async () => {
                const { data, error } = await admin
                    .from("google_seo_ai_visibility_runs")
                    .insert({
                        business_id: businessId,
                        query,
                        status: "running",
                        is_estimated: true,
                        method: ESTIMATED_METHOD.aiVisibility,
                    })
                    .select("id")
                    .single();
                if (error || !data?.id) throw new Error(error?.message || "Failed to create visibility run");
                return data as { id: string };
            });
            runId = run.id;

            const { data: business } = await admin
                .from("businesses")
                .select("id, average_rating")
                .eq("id", businessId)
                .maybeSingle();
            const { data: competitors } = await admin
                .from("competitors")
                .select("average_rating")
                .eq("business_id", businessId);

            const ownRating = Number(business?.average_rating || 0);
            const maxCompRating = Math.max(...(competitors || []).map((c) => Number(c.average_rating || 0)), 0);
            const likelyPresent = ownRating > 0 && ownRating >= maxCompRating;

            await step.run("store-ai-visibility-results", async () => {
                const rows = ESTIMATED_MODELS.map((model) => ({
                    run_id: run.id,
                    business_id: businessId,
                    model,
                    found: model === "ChatGPT" ? likelyPresent : false,
                    // No fabricated ordinal: the heuristic cannot know a position.
                    position: null,
                    snippet: "Estimated from rating vs. competitors. No engine was queried.",
                    is_estimated: true,
                    method: ESTIMATED_METHOD.aiVisibility,
                }));
                const { error } = await admin.from("google_seo_ai_visibility_results").insert(rows);
                if (error) throw new Error(error.message);
            });

            await step.run("complete-ai-visibility-run", async () => {
                await admin
                    .from("google_seo_ai_visibility_runs")
                    .update({ status: "success", completed_at: new Date().toISOString(), error_message: null })
                    .eq("id", run.id);
            });

            return { success: true, runId: run.id, models: ESTIMATED_MODELS.length };
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            if (runId) {
                await step.run("fail-ai-visibility-run", async () => {
                    await admin
                        .from("google_seo_ai_visibility_runs")
                        .update({ status: "failed", error_message: msg, completed_at: new Date().toISOString() })
                        .eq("id", runId as string);
                });
            }
            throw e;
        }
    }
);
