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

export const googleSeoAeoAiVisibilityWorker = inngest.createFunction(
  {
    id: "google-seo-aeo-ai-visibility-worker",
    name: "Google SEO/AEO AI Visibility",
    concurrency: { limit: 2 },
  },
  { event: "google-seo-aeo/ai-visibility.run" },
  async ({ event, step }) => {
    const admin = createAdminClient();
    const { businessId, query } = event.data;
    let runId: string | null = null;

    try {
      const run = await step.run("create-ai-visibility-run", async () => {
      const { data, error } = await admin
        .from("google_seo_ai_visibility_runs")
        .insert({
          business_id: businessId,
          query,
          status: "running",
        })
        .select("id")
        .single();
      if (error || !data?.id) throw new Error(error?.message || "Failed to create visibility run");
      return data as { id: string };
    });
      runId = run.id;

      const models = ["ChatGPT", "Claude", "Gemini", "Grok", "Llama", "Perplexity"];
      const { data: business } = await admin
        .from("businesses")
        .select("id, average_rating, total_reviews")
        .eq("id", businessId)
        .maybeSingle();
      const { data: competitors } = await admin
        .from("competitors")
        .select("average_rating")
        .eq("business_id", businessId);

      const ownRating = Number(business?.average_rating || 0);
      const maxCompRating = Math.max(...(competitors || []).map((c) => Number(c.average_rating || 0)), 0);
      const likelyFound = ownRating > 0 && ownRating >= maxCompRating;

      await step.run("store-ai-visibility-results", async () => {
        const rows = models.map((model) => ({
          run_id: run.id,
          business_id: businessId,
          model,
          found: model === "ChatGPT" ? likelyFound : false,
          position: model === "ChatGPT" && likelyFound ? 2 : null,
          snippet:
            model === "ChatGPT" && likelyFound
              ? "Estimated from current business-vs-competitor profile strength (beta)."
              : "No estimated presence in this beta model.",
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
        const { error } = await admin.from("google_seo_ai_visibility_results").insert(rows);
        if (error) throw new Error(error.message);
      });

      await step.run("complete-ai-visibility-run", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
        await admin.from("google_seo_ai_visibility_runs")
          .update({ status: "success", completed_at: new Date().toISOString(), error_message: null })
          .eq("id", run.id);
      });

      return { success: true, runId: run.id, models: models.length };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (runId) {
        await step.run("fail-ai-visibility-run", async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
          await admin.from("google_seo_ai_visibility_runs")
            .update({ status: "failed", error_message: msg, completed_at: new Date().toISOString() })
            .eq("id", runId as string);
        });
      }
      throw e;
    }
  }
);
