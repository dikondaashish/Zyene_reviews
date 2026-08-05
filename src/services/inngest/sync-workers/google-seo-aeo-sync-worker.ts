import { inngest } from "../client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getGoogleSearchKeywords } from "@/services/google/performance-queries";
import { areEstimatedAeoSurfacesEnabled } from "@/lib/features/aeo-surfaces";

/**
 * Fan-out for the Google SEO/AEO page pipeline.
 *
 * Its only job is to pick a keyword and enqueue the AI-visibility and heatmap
 * runs. Both of those are estimated surfaces, so when they are disabled this
 * worker has nothing to do — the page's own audit is computed live on load.
 */
export const googleSeoAeoSyncWorker = inngest.createFunction(
    {
        id: "google-seo-aeo-sync-worker",
        name: "Google SEO/AEO Sync",
        concurrency: { limit: 1, key: "event.data.businessId" },
    },
    { event: "google-seo-aeo/sync.run" },
    async ({ event, step }) => {
        const { businessId } = event.data;

        if (!areEstimatedAeoSurfacesEnabled()) {
            return { success: true, skipped: true, reason: "estimated_surfaces_disabled" };
        }

        const { query, keyword } = await step.run("determine-keyword", async () => {
            const admin = createAdminClient();
            const keywords = await getGoogleSearchKeywords(admin, businessId, 1);

            let term = "Best local business near me";
            if (keywords && keywords.length > 0) {
                term = keywords[0].keyword;
            } else {
                const { data: business } = await admin
                    .from("businesses")
                    .select("city")
                    .eq("id", businessId)
                    .maybeSingle();
                if (business?.city) {
                    term = `Best businesses in ${business.city}`;
                }
            }
            return { query: term, keyword: term };
        });

        await step.run("enqueue-ai-visibility", async () => {
            await inngest.send({ name: "google-seo-aeo/ai-visibility.run", data: { businessId, query } });
        });

        await step.run("enqueue-heatmap", async () => {
            await inngest.send({ name: "google-seo-aeo/heatmap.run", data: { businessId, keyword } });
        });

        return { success: true, businessId, query, keyword };
    }
);
