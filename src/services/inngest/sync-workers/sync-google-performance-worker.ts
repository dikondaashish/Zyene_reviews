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

export const syncGooglePerformanceWorker = inngest.createFunction(
  {
    id: "sync-google-performance-worker",
    name: "Sync Google Performance",
    concurrency: { limit: 1 },
  },
  { event: "cron/google-performance.run" },
  async ({ step }) => {
    const admin = createAdminClient();

    const platforms = await step.run("load-google-platforms", async () => {
      const { data, error } = await admin
        .from("review_platforms")
        .select("id, sync_status")
        .eq("platform", "google")
        .neq("sync_status", "running")
        .not("sync_status", "like", "error%")
        .not("google_location_id", "is", null);
      if (error) {
        throw new Error(`[Inngest][google-performance] Failed to load platforms: ${error.message}`);
      }
      return data || [];
    });

    const results: Array<{
      platformId: string;
      syncStatus?: string | null;
      performanceOk: boolean;
      performanceError?: string;
      emptyDailySeries?: boolean;
      dailyRowsUpserted?: number;
      keywordRowsUpserted?: number;
      ok: boolean;
      error?: string;
      phase2?: { ok: boolean; error?: string; questions?: number; placeLinks?: number };
      phase3?: { ok: boolean; error?: string; profileHealthScore?: number };
      phase4?: { ok: boolean; error?: string; lodgingAvailable?: boolean; lodgingHealthScore?: number };
    }> = [];

    for (const p of platforms) {
      const row = await step.run(`sync-google-performance-${p.id}`, async () => {
        const r = await syncGooglePerformanceForPlatform(p.id);

        let phase2: { ok: boolean; error?: string; questions?: number; placeLinks?: number } | undefined;
        try {
          const p2 = await syncGooglePhase2ForPlatform(p.id);
          phase2 = {
            ok: p2.success,
            error: p2.error,
            questions: p2.questionsUpserted,
            placeLinks: p2.placeLinksUpserted,
          };
        } catch (e: unknown) {
          phase2 = { ok: false, error: e instanceof Error ? e.message : String(e) };
        }

        let phase3: { ok: boolean; error?: string; profileHealthScore?: number } | undefined;
        try {
          const p3 = await syncGoogleListingProfileForPlatform(p.id);
          phase3 = { ok: p3.success, error: p3.error, profileHealthScore: p3.profileHealthScore };
        } catch (e: unknown) {
          phase3 = { ok: false, error: e instanceof Error ? e.message : String(e) };
        }

        let phase4:
          | { ok: boolean; error?: string; lodgingAvailable?: boolean; lodgingHealthScore?: number }
          | undefined;
        try {
          const p4 = await syncGoogleLodgingForPlatform(p.id);
          phase4 = {
            ok: p4.success,
            error: p4.error,
            lodgingAvailable: p4.lodgingAvailable,
            lodgingHealthScore: p4.healthScore,
          };
        } catch (e: unknown) {
          phase4 = { ok: false, error: e instanceof Error ? e.message : String(e) };
        }

        const ok = r.success && (phase2?.ok ?? false) && (phase3?.ok ?? false) && (phase4?.ok ?? false);
        return {
          platformId: p.id,
          syncStatus: p.sync_status,
          performanceOk: r.success,
          performanceError: r.error,
          emptyDailySeries: r.emptyDailySeries,
          dailyRowsUpserted: r.dailyRowsUpserted,
          keywordRowsUpserted: r.keywordRowsUpserted,
          ok,
          error: [r.error, phase2?.error, phase3?.error, phase4?.error].filter(Boolean).join(" | ") || undefined,
          phase2,
          phase3,
          phase4,
        };
      });
      results.push(row);
    }

    const performanceSucceeded = results.filter((r) => r.performanceOk).length;
    const allPhasesSucceeded = results.filter((r) => r.ok).length;
    await pingReviewSyncHeartbeat(true);

    return {
      success: true,
      platforms: platforms.length,
      succeeded: performanceSucceeded,
      succeededPerformance: performanceSucceeded,
      succeededAllPhases: allPhasesSucceeded,
      results,
    };
  }
);
