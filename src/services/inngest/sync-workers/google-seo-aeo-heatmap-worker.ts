import { logger } from "@/lib/logger";
import { inngest } from "../client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { syncGoogleReviewsForPlatform } from "@/services/google/sync-service";
import { isGoogleSyncConflictError } from "@/services/google/sync-lock-utils";
import { syncYelpReviewsForPlatform } from "@/services/yelp/sync-service";
import { syncFacebookReviewsForPlatform } from "@/services/facebook/sync-service";
import { syncGooglePerformanceForPlatform } from "@/services/google/performance-sync";
import { syncGooglePhase2ForPlatform } from "@/services/google/phase2-sync";
import { syncGoogleListingProfileForPlatform } from "@/services/google/phase3-sync";
import { syncGoogleLodgingForPlatform } from "@/services/google/phase4-sync";
import { weeklyDigestEmail } from "@/services/resend/templates/weekly-digest-email";
import { sendEmail } from "@/services/resend/send-email";
import { sendReviewRequest } from "@/lib/notifications/review-request";
import { pingReviewSyncHeartbeat } from "@/lib/monitoring/review-sync-heartbeat";

const PUBSUB_GOOGLE_LOCK_RETRY_DELAY = "30s";
const PUBSUB_GOOGLE_LOCK_MAX_ATTEMPTS = 3;

function isGoogleLockConflictSkip(value: unknown): boolean {
    if (typeof value !== "object" || value === null) return false;
    const o = value as { skipped?: boolean; reason?: string };
    return o.skipped === true && o.reason === "sync_lock_conflict";
}

export const googleSeoAeoHeatmapWorker = inngest.createFunction(
  {
    id: "google-seo-aeo-heatmap-worker",
    name: "Google SEO/AEO Heatmap",
    concurrency: { limit: 2 },
  },
  { event: "google-seo-aeo/heatmap.run" },
  async ({ event, step }) => {
    const admin = createAdminClient();
    const { businessId, keyword } = event.data;
    let runId: string | null = null;

    try {
      const run = await step.run("create-heatmap-run", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
      const { data, error } = await (admin.from("google_seo_heatmap_runs" as never) as any)
        .insert({
          business_id: businessId,
          keyword,
          status: "running",
        })
        .select("id")
        .single();
      if (error || !data?.id) throw new Error(error?.message || "Failed to create heatmap run");
      return data as { id: string };
    });
      runId = run.id;

      const { data: business } = await admin
        .from("businesses")
        .select("average_rating, total_reviews, city, state")
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
        const rows = labels.map((label, idx) => {
          const rank = Math.max(1, base + idx - 2);
          const visibility = Math.max(0, 100 - rank * 4);
          return {
            run_id: run.id,
            business_id: businessId,
            cell_label: label,
            rank_position: rank,
            visibility_score: visibility,
          };
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
        const { error } = await (admin.from("google_seo_heatmap_cells" as never) as any).insert(rows);
        if (error) throw new Error(error.message);
      });

      await step.run("complete-heatmap-run", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
        await (admin.from("google_seo_heatmap_runs" as never) as any)
          .update({ status: "success", completed_at: new Date().toISOString(), error_message: null })
          .eq("id", run.id);
      });

      return { success: true, runId: run.id, cells: labels.length };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (runId) {
        await step.run("fail-heatmap-run", async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
          await (admin.from("google_seo_heatmap_runs" as never) as any)
            .update({ status: "failed", error_message: msg, completed_at: new Date().toISOString() })
            .eq("id", runId as string);
        });
      }
      throw e;
    }
  }
);

import { getGoogleSearchKeywords } from "@/services/google/performance-queries";
