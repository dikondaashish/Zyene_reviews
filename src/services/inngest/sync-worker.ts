import { inngest } from "./client";
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

/**
 * Worker to sync a single review platform.
 * This runs in the background, fanned out from the Cron dispatcher.
 */
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
            console.error(
              `[Worker] Sync skipped (lock held elsewhere) for google platform ${platformId}` +
                (attempt < pubsubGoogleLockRetry ? ` — will retry after ${PUBSUB_GOOGLE_LOCK_RETRY_DELAY}` : "")
            );
            await pingReviewSyncHeartbeat(true);
            return { skipped: true, reason: "sync_lock_conflict" as const, attempt };
          }
          console.error(`[Worker] Sync failed for ${platformType} (${platformId}):`, error);
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
export const weeklyDigestWorker = inngest.createFunction(
  { id: "weekly-digest-worker", name: "Send Weekly Digest" },
  { event: "cron/weekly-digest.business" },
  async ({ event, step }) => {
    const { businessId } = event.data;
    const admin = createAdminClient();

    await step.run("process-digest", async () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // 1. Fetch Business & Reviews
      const { data: business } = await admin
        .from("businesses")
        .select("id, name, organization_id")
        .eq("id", businessId)
        .single();

      if (!business) return;

      const { data: reviews } = await admin
        .from("reviews")
        .select("rating, text, author_name, sentiment")
        .eq("business_id", businessId)
        .gte("created_at", weekAgo.toISOString());

      if (!reviews || reviews.length === 0) return;

      // 2. Status & Stats
      const { count: pendingCount } = await admin
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId)
        .is("response_text", null);

      const totalNew = reviews.length;
      const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalNew;
      const digestItems = reviews.slice(0, 5).map((r) => ({
        rating: r.rating,
        authorName: r.author_name || "Anonymous",
        text: r.text || "",
        sentiment: r.sentiment as "positive" | "negative" | "neutral"
      }));

      // 3. Get Recipients
      const { data: members } = await admin
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", business.organization_id);

      if (!members || members.length === 0) return;

      const userIds = members.map(m => m.user_id);
      const { data: prefs } = await admin
        .from("notification_preferences")
        .select("*, users(email)")
        .eq("business_id", businessId)
        .in("user_id", userIds);

      const recipients = prefs?.filter(p => {
        const pTyped = p as { digest_enabled?: boolean; users: { email?: string } | null };
        return pTyped.digest_enabled !== false && pTyped.users?.email;
      }) || [];

      if (recipients.length === 0) return;

      // 4. Send Emails
      const emailHtml = weeklyDigestEmail({
        businessName: business.name,
        reviews: digestItems,
        totalNew,
        avgRating,
        pendingCount: pendingCount || 0,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        settingsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications`
      });

      await Promise.all(recipients.map(r => {
        const rTyped = r as { users: { email: string } };
        return sendEmail({
          to: rTyped.users.email,
          subject: `Weekly review summary for ${business.name}`,
          html: emailHtml
        });
      }));
    });
  }
);

/**
 * Worker to process follow-ups for a single campaign.
 */
export const followUpWorker = inngest.createFunction(
  { id: "follow-up-worker", name: "Process Follow-ups" },
  { event: "cron/follow-up.campaign" },
  async ({ event, step }) => {
    const { campaignId } = event.data;
    const admin = createAdminClient();

    await step.run("process-follow-ups", async () => {
      // 1. Fetch Campaign
      const { data: campaign } = await admin
        .from("campaigns")
        .select("*, businesses (id, name, sender_name)")
        .eq("id", campaignId)
        .single();

      if (!campaign || !campaign.follow_up_enabled) return;

      const delayHours = campaign.follow_up_delay_hours || 72;
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - delayHours);

      // 2. Fetch Eligible Requests
      const { data: requests } = await admin
          .from("review_requests")
          .select("id, customer_name, customer_email, customer_phone")
          .eq("campaign_id", campaignId)
          .eq("status", "delivered")
          .eq("review_left", false)
          .is("completed_at", null)
          .eq("is_follow_up_sent", false)
          .lt("sent_at", cutoffTime.toISOString())
          .limit(100);

      if (!requests || requests.length === 0) return;

      // 3. Process
      for (const req of requests) {
        const methods = [];
        if ((campaign.channel === "email" || campaign.channel === "both") && req.customer_email) methods.push("email");
        if ((campaign.channel === "sms" || campaign.channel === "both") && req.customer_phone) methods.push("sms");

        try {
          const business = Array.isArray(campaign.businesses) ? campaign.businesses[0] : campaign.businesses;
          if (!business) continue;

          await sendReviewRequest({
            businessId: business.id,
            businessName: business.name,
            senderName: (business as { sender_name?: string | null }).sender_name ?? null,
            customerName: req.customer_name || "Customer",
            contactMethods: methods as ("email" | "sms")[],
            customerEmail: req.customer_email,
            customerPhone: req.customer_phone,
            template: campaign.follow_up_template || undefined,
            isFollowUp: true
          });

          await admin.from("review_requests").update({
            is_follow_up_sent: true,
            follow_up_sent_at: new Date().toISOString()
          }).eq("id", req.id);
        } catch (e) {
          console.error(`[Worker] Follow-up failed for request ${req.id}:`, e);
        }
      }
    });
  }
);

/**
 * Background Google Performance sync (triggered by lightweight cron endpoint).
 */
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
      const { data, error } = await (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
        admin.from("google_seo_ai_visibility_runs" as never) as any
      )
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
        const { error } = await (admin.from("google_seo_ai_visibility_results" as never) as any).insert(rows);
        if (error) throw new Error(error.message);
      });

      await step.run("complete-ai-visibility-run", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
        await (admin.from("google_seo_ai_visibility_runs" as never) as any)
          .update({ status: "success", completed_at: new Date().toISOString(), error_message: null })
          .eq("id", run.id);
      });

      return { success: true, runId: run.id, models: models.length };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (runId) {
        await step.run("fail-ai-visibility-run", async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
          await (admin.from("google_seo_ai_visibility_runs" as never) as any)
            .update({ status: "failed", error_message: msg, completed_at: new Date().toISOString() })
            .eq("id", runId as string);
        });
      }
      throw e;
    }
  }
);

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

export const googleSeoAeoSyncWorker = inngest.createFunction(
  {
    id: "google-seo-aeo-sync-worker",
    name: "Google SEO/AEO Sync",
    concurrency: { limit: 1, key: "event.data.businessId" },
  },
  { event: "google-seo-aeo/sync.run" },
  async ({ event, step }) => {
    const { businessId } = event.data;
    
    const { query, keyword } = await step.run("determine-keyword", async () => {
      const admin = createAdminClient();
      const keywords = await getGoogleSearchKeywords(admin, businessId, 1);
      
      let term = "Best local business near me";
      if (keywords && keywords.length > 0) {
        term = keywords[0].keyword;
      } else {
        const { data: business } = await admin.from("businesses").select("city").eq("id", businessId).maybeSingle();
        if (business?.city) {
           term = `Best businesses in ${business.city}`;
        }
      }
      return { query: term, keyword: term };
    });

    await step.run("enqueue-ai-visibility", async () => {
      await inngest.send({
        name: "google-seo-aeo/ai-visibility.run",
        data: { businessId, query },
      });
    });

    await step.run("enqueue-heatmap", async () => {
      await inngest.send({
        name: "google-seo-aeo/heatmap.run",
        data: { businessId, keyword },
      });
    });

    return { success: true, businessId, query, keyword };
  }
);
