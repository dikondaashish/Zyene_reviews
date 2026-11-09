/** Google review sync - process-review */

import { logger } from "@/lib/logger";
import type { GoogleReview } from "@/services/google/business-profile";
import { computeReviewHash } from "@/utils/review-hash";
import {
  enqueueAutoReplyJob,
  reviewQualifiesForAutoReplyEnqueue,
  type AutoReplyBusinessSettings,
} from "@/services/reviews/auto-reply-eligibility";
import {
  EXISTING_REPLY_STATE_COLUMNS,
  resolveSyncedReplyState,
  type ExistingReplyState,
} from "./synced-reply-state";
import {
  googleAttributeChips,
  googlePlaceContext,
  googleReviewPhotoUrls,
  reviewerAvatarFromGoogle,
  sameReviewReplyText,
  type AdminClient,
  type ReviewPlatformRef,
} from "./helpers";
import { isTransientSupabaseError, sleepMs } from "./transient-supabase";

const UPSERT_ATTEMPTS = 3;

/**
 * Processes a single Google Review: Upserts to DB.
 */
export async function processGoogleReview(
    admin: AdminClient,
    platform: ReviewPlatformRef,
    review: GoogleReview,
    autoReplySettings?: AutoReplyBusinessSettings | null,
    opts?: {
        existing?: (ExistingReplyState & { content_hash?: string | null }) | null;
        contentHash?: string;
        googleUpdateTime?: string;
    }
) {
    const ratingMap: Record<string, number> = { "FIVE": 5, "FOUR": 4, "THREE": 3, "TWO": 2, "ONE": 1 };
    const numericRating = ratingMap[review.starRating] || 0;

    const { data: existing } =
        opts && "existing" in opts && opts.existing !== undefined
            ? { data: opts.existing }
            : await admin
                  .from("reviews")
                  .select(EXISTING_REPLY_STATE_COLUMNS)
                  .eq("business_id", platform.business_id)
                  .eq("platform", "google")
                  .eq("external_id", review.reviewId)
                  .maybeSingle();

    const replyState = resolveSyncedReplyState(review.reviewReply, existing, sameReviewReplyText);

    const resolvedContentHash = opts?.contentHash ?? computeReviewHash(review);
    const reviewData = {
        business_id: platform.business_id,
        platform: "google",
        platform_id: platform.id,
        external_id: review.reviewId,
        author_name: review.reviewer.displayName,
        author_avatar_url: reviewerAvatarFromGoogle(review.reviewer),
        rating: numericRating,
        text: review.comment || "",
        review_date: review.createTime,
        google_update_time: opts?.googleUpdateTime ?? review.updateTime,
        content_hash: resolvedContentHash,
        ...replyState,
        review_photo_urls: googleReviewPhotoUrls(review),
        google_attribute_chips: googleAttributeChips(review),
        google_place_context: googlePlaceContext(review),
        is_visible: true,
    };

    let upserted: {
        id: string;
        sentiment: string | null;
        text: string | null;
        created_at: string;
    } | null = null;
    let upsertError: unknown = null;
    for (let attempt = 1; attempt <= UPSERT_ATTEMPTS; attempt++) {
        const result = await admin
            .from("reviews")
            .upsert(reviewData, { onConflict: "business_id, platform, external_id" })
            .select("id, sentiment, text, created_at")
            .single();
        upserted = result.data;
        upsertError = result.error;
        if (!result.error || !isTransientSupabaseError(result.error) || attempt === UPSERT_ATTEMPTS) {
            break;
        }
        await sleepMs(200 * attempt);
    }

    let upsertedOk = false;
    let needsAnalysis = false;
    let isNew = false;

    if (upsertError) {
        logger.error({ err: upsertError }, "Upsert Error:");
    } else {
        upsertedOk = true;
        // If created_at is very recent (within last 10 seconds of upsert), it's brand new
        const createdAt = upserted?.created_at ? new Date(upserted.created_at) : null;
        if (createdAt && (Date.now() - createdAt.getTime() < 10000)) {
            isNew = true;
        }

        // Mark for analysis if text exists and not already analyzed
        if (upserted && !upserted.sentiment && upserted.text) {
            needsAnalysis = true;
        }

        // Only a review still waiting for a reply may be auto-answered: not one the
        // owner ignored, nor one Zyene replied to that Google hasn't listed yet.
        if (
            replyState.response_status === "pending" &&
            reviewQualifiesForAutoReplyEnqueue(review, numericRating, autoReplySettings, upserted?.id)
        ) {
            try {
                await enqueueAutoReplyJob(upserted!.id);
            } catch (e) {
                logger.error({ err: e }, "[AutoReply] Failed to enqueue job:");
            }
        }
    }

    return { upserted: upsertedOk, id: upserted?.id, needsAnalysis, isNew, error: upsertError };
}
