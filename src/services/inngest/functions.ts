import { inngest } from "./client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendReviewRequest } from "@/lib/notifications/review-request";
import { generateContentWithFallback } from "@/domains/ai/adapters/VertexAdapter";
import { BATCH_REVIEWS_PROMPT } from "@/domains/ai/prompts";
import { sendReviewAlert } from "@/lib/notifications/review-alert";
import { batchAnalysisSchema } from "@/domains/ai/schemas/ResponseSchemas";
import {
    syncGoogleReviewsForPlatform,
    prepareGoogleSync,
    syncGoogleReviewsPage,
    finalizeGoogleSync,
    enqueueMissingGoogleReviewAnalysis,
    hideGoogleReviewsRemovedFromSource,
} from "@/services/google/sync-service";
import { MAX_REVIEW_PAGES } from "@/services/google/constants";
import { syncGooglePerformanceForPlatform } from "@/services/google/performance-sync";
import {
    normalizeSentimentForDb,
    normalizeThemesForDb,
    normalizeUrgencyForDb,
} from "@/domains/ai/normalizeAnalysisForDb";
import { pingReviewSyncHeartbeat } from "@/lib/monitoring/review-sync-heartbeat";
import { checkLimit } from "@/lib/stripe/check-limits";
import { planAllowsAutoCommenter } from "@/services/stripe/plans";
import { generateReplyDraftText, type ReplyTone } from "@/domains/ai/services/generateReplyDraft";
import { postGoogleReplySystem } from "@/services/reviews/post-google-reply-system";
import {
    AUTO_REPLY_ENABLED_AT_SKEW_MS,
    AUTO_REPLY_MAX_REVIEW_AGE_MS,
} from "@/services/reviews/auto-reply-eligibility";
import { acquireLock, releaseLock } from "@/lib/db/redis-lock";
import { processOneScheduled } from "@/lib/review-requests/process-scheduled-queue";

const AUTO_REPLY_TONES: ReplyTone[] = ["professional", "friendly", "concise"];

// This background job runs for EACH contact asynchronously
// ... (rest of the file remains the same until syncGoogleReviews)
export const processCampaignContact = inngest.createFunction(
    {
        id: "process-campaign-contact",
        name: "Process Campaign Contact",
        concurrency: {
            // Inngest free/hobby plans cap per-function concurrency at 5; higher values fail sync.
            limit: 5,
        }
    },
    { event: "campaign/send.contact" },
    async ({ event, step }: { event: { data: { campaignId: string, businessId: string, contact: any } }, step: any }) => {
        const { campaignId, businessId, contact } = event.data;
        const supabase = createAdminClient();

        // 1. Get Campaign and Business details
        const campaign = await step.run("fetch-campaign-details", async () => {
            const { data, error } = await supabase
                .from("campaigns")
                .select("*, businesses(name, slug, review_request_frequency_cap_days, review_platforms(platform))")
                .eq("id", campaignId)
                .single();
            if (error || !data) throw new Error(`Campaign not found: ${campaignId}`);
            return data;
        });

        interface CampaignWithBusiness {
            businesses: {
                name: string;
                slug: string;
                review_request_frequency_cap_days: number | null;
                review_platforms: Array<{ platform: string }>;
            } | null;
        }
        const business = (campaign as unknown as CampaignWithBusiness).businesses;
        if (!business) throw new Error("Business not found for campaign");

        // 2. Filter contacts (Frequency Cap & Opt-out checks)
        const canSend = await step.run("check-permissions", async () => {
            // Check global opt-out
            if (contact.phone) {
                const { data: optOut } = await supabase
                    .from("sms_opt_outs")
                    .select("id")
                    .eq("phone_number", contact.phone)
                    .single();
                if (optOut) return { allowed: false, reason: "Customer opted out of SMS" };

                // Check frequency cap
                const frequencyCapDays = business.review_request_frequency_cap_days || 30;
                const { data: existingContact } = await supabase
                    .from("customers")
                    .select("last_request_sent_at")
                    .eq("business_id", businessId)
                    .eq("phone", contact.phone)
                    .single();

                interface CustomerRecord {
                    last_request_sent_at?: string | null;
                }
                const existingCustTyped = existingContact as unknown as CustomerRecord;

                if (existingCustTyped?.last_request_sent_at) {
                    const lastSent = new Date(existingCustTyped.last_request_sent_at);
                    const now = new Date();
                    const diffDays = (now.getTime() - lastSent.getTime()) / (1000 * 3600 * 24);
                    if (diffDays < frequencyCapDays) {
                        return { allowed: false, reason: `Frequency cap: sent within ${frequencyCapDays} days` };
                    }
                }
            }
            return { allowed: true, reason: undefined as string | undefined };
        });

        // 3. Create Request Record explicitly as "queued" or "skipped"
        const requestRecord = await step.run("create-request-record", async () => {
            const status = canSend.allowed ? (campaign.delay_minutes > 0 ? "queued" : "sending") : "skipped";
            const { data, error } = await supabase
                .from("review_requests")
                .insert({
                    business_id: businessId,
                    campaign_id: campaignId,
                    customer_name: contact.name || null,
                    customer_phone: contact.phone || null,
                    customer_email: contact.email || null,
                    channel: campaign.channel,
                    status: status,
                    error_message: canSend.reason || null
                })
                .select()
                .single();
            if (error) throw new Error(`Failed to create request: ${error.message}`);
            return data;
        });

        if (!canSend.allowed) {
            return { status: "skipped", reason: canSend.reason };
        }

        // 4. Handle Initial Delay
        if (campaign.delay_minutes > 0) {
            // Sleep for the specified delay
            await step.sleep("initial-delay", `${campaign.delay_minutes}m`);

            // Update status to sending
            await step.run("update-status-sending", async () => {
                await supabase
                    .from("review_requests")
                    .update({ status: "sending" })
                    .eq("id", requestRecord.id);
            });
        }

        // 5. Send Initial Message
        const sendResult = await step.run("send-message", async () => {
            const contactMethods: ("email" | "sms")[] = [];
            if (campaign.channel === "email" || campaign.channel === "both") {
                if (contact.email) contactMethods.push("email");
            }
            if (campaign.channel === "sms" || campaign.channel === "both") {
                if (contact.phone) contactMethods.push("sms");
            }

            if (contactMethods.length === 0) {
                return { sendStatus: "failed", errorMessage: "Missing contact info for campaign type" };
            }

            const result = await sendReviewRequest({
                businessId: businessId,
                businessName: business.name,
                customerName: contact.name || "Customer",
                contactMethods,
                customerEmail: contact.email,
                customerPhone: contact.phone,
                template: campaign.sms_template || campaign.email_template || undefined
            });

            return {
                sendStatus: (result.emailSent || result.smsSent) ? "sent" : "failed",
                errorMessage: result.error
            };
        });

        // 6. Update Database for Initial Send
        await step.run("update-initial-database", async () => {
            await supabase
                .from("review_requests")
                .update({
                    status: sendResult.sendStatus,
                    error_message: sendResult.errorMessage,
                    sent_at: sendResult.sendStatus === "sent" ? new Date().toISOString() : null,
                })
                .eq("id", requestRecord.id);

            // Atomic frequency cap tracking via RPC
            if (contact.phone) {
                await supabase.rpc("increment_customer_requests", {
                    p_business_id: businessId,
                    p_phone: contact.phone,
                });
            }
        });

        if (sendResult.sendStatus !== "sent") {
            return { status: "completed_with_error", sendResult };
        }

        return { status: "completed", sendResult };
    }
);

/**
 * Scheduled review request send (manual scheduling from Requests page).
 * Inngest sleeps until `sendAt`, then claims the row (queued → processing), sends, and updates status.
 * Redis lock prevents double-sends across retries/duplicate events.
 */
export const processScheduledReviewRequest = inngest.createFunction(
    {
        id: "process-scheduled-review-request",
        name: "Process Scheduled Review Request",
        concurrency: { limit: 10 },
    },
    { event: "review-request/scheduled.send" },
    async ({ event, step }: { event: { data: { reviewRequestId: string; sendAt: string } }; step: any }) => {
        const admin = createAdminClient();
        const reviewRequestId = event.data.reviewRequestId;
        const sendAtIso = event.data.sendAt;

        const sendAt = new Date(sendAtIso);
        if (Number.isNaN(sendAt.getTime())) {
            throw new Error(`Invalid sendAt: ${sendAtIso}`);
        }

        // 1) Wait until scheduled time
        await step.run("sleep-until-send", async () => {
            if (sendAt.getTime() > Date.now()) {
                // Inngest supports sleepUntil; step is typed as any here.
                await step.sleepUntil("scheduled-wait", sendAt);
            }
        });

        // 2) Lock to prevent double-send (10 minutes)
        const lockKey = `lock:review-request:${reviewRequestId}`;
        const locked = await step.run("acquire-lock", async () => acquireLock(lockKey, 600));
        if (!locked) {
            return { status: "locked" };
        }

        try {
            // 3) Load row (must be queued) and process
            const row = await step.run("fetch-request", async () => {
                const { data } = await admin
                    .from("review_requests")
                    .select("id, business_id, customer_name, customer_phone, customer_email, channel, status")
                    .eq("id", reviewRequestId)
                    .maybeSingle();
                return data as
                    | {
                          id: string;
                          business_id: string;
                          customer_name: string | null;
                          customer_phone: string | null;
                          customer_email: string | null;
                          channel: string;
                          status: string;
                      }
                    | null;
            });

            if (!row) {
                return { status: "missing" };
            }
            if (row.status !== "queued") {
                return { status: "not_queued", current: row.status };
            }

            const result = await step.run("send-scheduled", async () => processOneScheduled(admin, row));
            return { status: result };
        } finally {
            await step.run("release-lock", async () => releaseLock(lockKey));
        }
    },
);

// This background job analyzes reviews in dynamic batches using Gemini
export const processReviewAnalysisBatch = inngest.createFunction(
    {
        id: "process-review-analysis-batch",
        name: "Process Review Analysis Batch",
        concurrency: {
            limit: 5, // Process 5 batches at once max to stay within Gemini rate limits
        }
    },
    { event: "review/analyze.batch" },
    async ({ event, step }: { event: { data: { reviewIds: string[] } }, step: any }) => {
        const { reviewIds } = event.data;
        const supabase = createAdminClient();

        // 1. Fetch the reviews from Supabase
        const reviews = await step.run("fetch-reviews", async () => {
            const { data, error } = await supabase
                .from("reviews")
                .select("id, rating, text")
                .in("id", reviewIds);
            if (error) throw new Error(`Failed to fetch reviews: ${error.message}`);
            return data;
        });

        if (!reviews || reviews.length === 0) return { status: "no_reviews_found" };

        // 2. Format for AI
        // Must use `reviewId` in the payload — the model output schema uses reviewId; using `id` often causes
        // the model to return `id` instead, so .eq("id", result.reviewId) updates zero rows.
        const reviewsForAi = reviews.map((r: { id: string, rating: number, text: string | null }) => ({
            reviewId: r.id,
            rating: r.rating,
            text: r.text || ""
        }));

        const prompt = BATCH_REVIEWS_PROMPT
            .replace(/\{count\}/g, reviewsForAi.length.toString())
            .replace("{reviews_json}", JSON.stringify(reviewsForAi, null, 2));

        // 3. Call Gemini with Fallback
        const aiResults = await step.run("call-gemini-batch", async () => {
            const content = await generateContentWithFallback(prompt, {
                requireJson: true,
                schema: batchAnalysisSchema,
            });
            
            try {
                return JSON.parse(content);
            } catch (err) {
                console.error("[Batch Analysis] Failed to parse AI JSON inside schema step:", content);
                throw new Error("AI returned invalid JSON array despite schema enforcement");
            }
        });

        // 4. Update reviews in Supabase
        await step.run("update-reviews-batch", async () => {
            if (!Array.isArray(aiResults)) {
                console.error("[Batch Analysis] AI result is not an array:", typeof aiResults);
                throw new Error("AI returned non-array batch result");
            }
            for (const result of aiResults as Array<{
                reviewId?: string;
                id?: string;
                sentiment?: string;
                urgency?: number;
                themes?: string[];
                summary?: string;
            }>) {
                const reviewRowId = result.reviewId ?? result.id;
                if (!reviewRowId) {
                    console.warn("[Batch Analysis] Skipping row missing reviewId/id:", result);
                    continue;
                }

                const { error: updateError } = await supabase
                    .from("reviews")
                    .update({
                        sentiment: normalizeSentimentForDb(result.sentiment),
                        urgency_score: normalizeUrgencyForDb(result.urgency),
                        themes: normalizeThemesForDb(result.themes),
                        ai_summary: result.summary ?? "",
                    })
                    .eq("id", reviewRowId);

                if (updateError) {
                    console.error(`[Batch Analysis] Update failed for ${reviewRowId}:`, updateError);
                }

                if (result.urgency !== undefined && result.urgency >= 7) {
                    const reviewObj = reviews.find((r: { id: string }) => r.id === reviewRowId);
                    if (reviewObj) {
                        await sendReviewAlert({ ...reviewObj, ...result });
                    }
                }
            }
        });

        return { status: "completed", processed: aiResults.length };
    }
);

export const processAutoReplyReview = inngest.createFunction(
    {
        id: "process-auto-reply-review",
        name: "Auto-reply to Google review (AI)",
        concurrency: { limit: 1, key: "event.data.reviewId" },
        retries: 2,
    },
    { event: "review/auto-reply" },
    async ({ event, step }: { event: { data: { reviewId: string } }; step: any }) => {
        const { reviewId } = event.data;

        const gate = await step.run("gate-check", async () => {
            const admin = createAdminClient();
            const { data: row, error } = await admin
                .from("reviews")
                .select(`
                    id,
                    rating,
                    text,
                    response_status,
                    platform,
                    review_date,
                    selected_staff,
                    businesses!inner (
                        id,
                        name,
                        category,
                        organization_id,
                        auto_reply_enabled,
                        auto_reply_enabled_at,
                        auto_reply_min_rating,
                        auto_reply_tone,
                        organizations!inner ( id, plan, plan_status )
                    )
                `)
                .eq("id", reviewId)
                .single();

            if (error || !row) {
                return { ok: false as const, reason: "review_not_found" };
            }
            if (row.platform !== "google" || row.response_status !== "pending") {
                return { ok: false as const, reason: "not_eligible_state" };
            }

            const biz = row.businesses as unknown as {
                id: string;
                name: string | null;
                category: string | null;
                organization_id: string;
                auto_reply_enabled: boolean;
                auto_reply_enabled_at: string | null;
                auto_reply_min_rating: number;
                auto_reply_tone: string;
                organizations: { id: string; plan: string | null; plan_status: string | null } | null;
            };

            if (!biz?.auto_reply_enabled) {
                return { ok: false as const, reason: "auto_reply_disabled" };
            }

            if (!planAllowsAutoCommenter(biz.organizations?.plan, biz.organizations?.plan_status)) {
                return { ok: false as const, reason: "plan_not_eligible" };
            }
            if (!biz.auto_reply_enabled_at) {
                return { ok: false as const, reason: "auto_reply_no_cutoff" };
            }
            if ((row.rating as number) < biz.auto_reply_min_rating) {
                return { ok: false as const, reason: "rating_below_threshold" };
            }

            const reviewedAt = row.review_date ? new Date(row.review_date as string) : null;
            if (!reviewedAt || Number.isNaN(reviewedAt.getTime())) {
                return { ok: false as const, reason: "bad_review_date" };
            }
            if (Date.now() - reviewedAt.getTime() > AUTO_REPLY_MAX_REVIEW_AGE_MS) {
                return { ok: false as const, reason: "review_too_old" };
            }
            const enabledAt = new Date(biz.auto_reply_enabled_at);
            if (Number.isNaN(enabledAt.getTime())) {
                return { ok: false as const, reason: "bad_auto_reply_enabled_at" };
            }
            if (reviewedAt.getTime() < enabledAt.getTime() - AUTO_REPLY_ENABLED_AT_SKEW_MS) {
                return { ok: false as const, reason: "review_before_auto_reply_enabled" };
            }

            const orgId = biz.organization_id;
            const limit = await checkLimit(orgId, "smart_replies");
            if (!limit.allowed) {
                return { ok: false as const, reason: "smart_reply_limit" };
            }

            const tone = (AUTO_REPLY_TONES.includes(biz.auto_reply_tone as ReplyTone)
                ? biz.auto_reply_tone
                : "professional") as ReplyTone;

            return {
                ok: true as const,
                orgId,
                businessId: biz.id,
                tone,
                businessName: biz.name || "our business",
                businessCategory: (biz.category || "local").trim() || "local",
                plan: biz.organizations?.plan,
                rating: row.rating as number,
                reviewText: (row.text as string) || "",
                selectedStaff: row.selected_staff as string[] | null,
            };
        });

        if (!gate.ok) {
            console.info(`[AutoReply] Skip ${reviewId}: ${gate.reason}`);
            return { status: "skipped", reason: gate.reason };
        }

        const draft = await step.run("generate-draft", async () => {
            return await generateReplyDraftText({
                businessName: gate.businessName,
                businessCategory: gate.businessCategory,
                rating: gate.rating,
                reviewText: gate.reviewText,
                selectedStaff: gate.selectedStaff,
                tone: gate.tone,
                plan: gate.plan,
                varietyKey: reviewId,
                rotationScope: gate.businessId,
            });
        });

        if (!draft || draft.length < 3) {
            console.warn(`[AutoReply] Empty draft for ${reviewId}`);
            return { status: "skipped", reason: "empty_draft" };
        }

        await step.run("post-to-google", async () => {
            await postGoogleReplySystem(reviewId, draft);
        });

        await step.run("increment-ai-meter", async () => {
            const admin = createAdminClient();
            await admin.rpc("increment_ai_replies_used", { org_id: gate.orgId });
        });

        return { status: "completed", reviewId };
    }
);

// This function handles the background sync for Google reviews with chunking
export const syncGoogleReviews = inngest.createFunction(
    {
        id: "sync-google-reviews",
        name: "Sync Google Reviews",
        concurrency: {
            limit: 5,
        },
    },
    { event: "google/sync.reviews" },
    async ({ event, step }: { event: { data: { platformId: string } }, step: any }) => {
        const { platformId } = event.data;
        const supabase = createAdminClient();

        try {
            // 1. Setup Context (Lock, IDs, Token)
            const context = await step.run("setup-context", async () => {
                return await prepareGoogleSync(platformId);
            });

            let pageToken: string | undefined = undefined;
            let totalSynced = 0;
            let lastResp: { total: number; avgRating: number } | null = null;
            let pageCount = 0;
            const seenGoogleExternalIds: string[] = [];

            // 2. Paginated Sync (Each page is a Step)
            do {
                const result = await step.run(`sync-page-${pageCount + 1}`, async () => {
                    return await syncGoogleReviewsPage(context, pageToken);
                });

                pageToken = result.nextPageToken;
                totalSynced += result.synced;
                lastResp = { total: result.total, avgRating: result.avgRating };
                seenGoogleExternalIds.push(...result.externalIdsOnPage);
                pageCount++;
            } while (pageToken && pageCount < MAX_REVIEW_PAGES);

            const fullListFetched = !pageToken;

            await step.run("reconcile-removed-google-reviews", async () => {
                const admin = createAdminClient();
                return hideGoogleReviewsRemovedFromSource(admin, {
                    businessId: context.platform.business_id,
                    platformId: context.platform.id,
                    googleExternalIdsSeen: new Set(seenGoogleExternalIds),
                    reconciliationSafe: fullListFetched,
                });
            });

            // 3. Finalize
            await step.run("finalize-sync", async () => {
                await finalizeGoogleSync(
                    platformId,
                    context.platform.business_id,
                    lastResp?.total,
                    lastResp?.avgRating
                );
                const admin = createAdminClient();
                const highWater = context.highestReviewUpdateTime;
                if (typeof highWater === "string" && highWater.length > 0) {
                    await admin
                        .from("review_platforms")
                        .update({ last_review_update_time: highWater })
                        .eq("id", platformId);
                }
            });

            // Listing performance + search keywords (same data as daily cron `/api/cron/google-performance`)
            await step.run("sync-google-performance", async () => {
                const r = await syncGooglePerformanceForPlatform(platformId);
                if (!r.success) {
                    console.warn(
                        `[Inngest] Google Business Profile performance sync failed for ${platformId}:`,
                        r.error
                    );
                }
                return r;
            });

            await step.run("enqueue-missing-analysis", async () => {
                return enqueueMissingGoogleReviewAnalysis(context.platform.business_id);
            });

            await pingReviewSyncHeartbeat(true);

            return { status: "completed", pages: pageCount, synced: totalSynced };
        } catch (error: any) {
            console.error(`[Inngest] Sync failed for platform ${platformId}:`, error);

            // Update status to error in DB so it's not stuck as "running"
            await step.run("mark-as-error", async () => {
                await supabase
                    .from("review_platforms")
                    .update({
                        sync_status: "error",
                        locked_until: null, // Release lock
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", platformId);
            });

            throw error; // Rethrow for Inngest retries if needed
        }
    }
);
