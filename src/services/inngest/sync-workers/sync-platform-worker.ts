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

export const syncPlatformWorker = inngest.createFunction(
  { id: "sync-platform-worker", name: "Sync Review Platform" },
  { event: "review/sync.platform" },
  async ({ event, step }) => {
    const { platformId, platformType, googleLocationId, triggerSource } = event.data;

    const pubsubGoogleLockRetry =
        triggerSource === "pubsub" && platformType === "google"
            ? PUBSUB_GOOGLE_LOCK_MAX_ATTEMPTS
            : 1;

    let lastResult: unknown;

    for (let attempt = 1; attempt <= pubsubGoogleLockRetry; attempt++) {
      if (attempt > 1) {
        await step.sleep(`pubsub-google-lock-wait-${attempt}`, PUBSUB_GOOGLE_LOCK_RETRY_DELAY);
      }

      lastResult = await step.run(`sync-${platformType}-attempt-${attempt}`, async () => {
        try {
          let result: unknown;
          if (platformType === "google") {
            result = await syncGoogleReviewsForPlatform(platformId);
          } else if (platformType === "yelp") {
            result = await syncYelpReviewsForPlatform(platformId);
          } else if (platformType === "facebook") {
            result = await syncFacebookReviewsForPlatform(platformId);
          } else {
            throw new Error(`Unknown platform type: ${platformType}`);
          }
          await pingReviewSyncHeartbeat(true);
          return result;
        } catch (error) {
          if (platformType === "google" && isGoogleSyncConflictError(error)) {
            logger.error(`[Worker] Sync skipped (lock held elsewhere) for google platform ${platformId}` +
                (attempt < pubsubGoogleLockRetry ? ` — will retry after ${PUBSUB_GOOGLE_LOCK_RETRY_DELAY}` : "")
            );
            await pingReviewSyncHeartbeat(true);
            return { skipped: true, reason: "sync_lock_conflict" as const, attempt };
          }
          logger.error({ err: error, platformType, platformId }, "[Worker] Sync failed");
          throw error; // Rethrow for Inngest retries
        }
      });

      if (!isGoogleLockConflictSkip(lastResult)) {
        return lastResult;
      }
      if (attempt >= pubsubGoogleLockRetry) {
        const lastAttempt =
            typeof lastResult === "object" && lastResult !== null
                ? (lastResult as { attempt?: number }).attempt
                : undefined;
        return {
          skipped: true,
          reason: "sync_lock_conflict" as const,
          exhaustedPubsubRetries: true,
          attempts: pubsubGoogleLockRetry,
          attempt: lastAttempt,
        };
      }
    }

    return lastResult;
  }
);

/**
 * Worker to process weekly digest for a single business (cron fans out one event per business).
 */
