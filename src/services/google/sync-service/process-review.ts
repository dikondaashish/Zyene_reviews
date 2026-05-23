/** Google review sync — process-review */

import type { GoogleReview } from "../business-profile";
import { computeReviewHash } from "@/utils/review-hash";
import {
  enqueueAutoReplyJob,
  reviewQualifiesForAutoReplyEnqueue,
  type AutoReplyBusinessSettings,
} from "@/services/reviews/auto-reply-eligibility";
import {
  isZyeneOriginatedReplySource,
  REVIEW_RESPONSE_SOURCE_GOOGLE,
} from "@/lib/reviews/response-source";
import {
  googleAttributeChips,
  googlePlaceContext,
  googleReviewPhotoUrls,
  reviewerAvatarFromGoogle,
  sameReviewReplyText,
  type AdminClient,
  type ReviewPlatformRef,
} from "./helpers";

/**
 * Processes a single Google Review: Upserts to DB.
 */
export async function processGoogleReview(
    admin: AdminClient,
    platform: ReviewPlatformRef,
    review: GoogleReview,
    autoReplySettings?: AutoReplyBusinessSettings | null,
    opts?: {
        existing?: { content_hash?: string | null; response_source?: string | null; response_text?: string | null } | null;
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
                  .select("content_hash, response_source, response_text")
                  .eq("business_id", platform.business_id)
                  .eq("platform", "google")
                  .eq("external_id", review.reviewId)
                  .maybeSingle();

    const googleReplyText = review.reviewReply?.comment ?? "";
    let responseSource: string | null = null;
    if (review.reviewReply) {
        const preserveZyene =
            !!existing &&
            isZyeneOriginatedReplySource(existing.response_source) &&
            sameReviewReplyText(existing.response_text, googleReplyText);
        responseSource = preserveZyene ? existing.response_source! : REVIEW_RESPONSE_SOURCE_GOOGLE;
    }

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
        response_status: review.reviewReply ? "responded" : "pending",
        response_text: review.reviewReply?.comment || null,
        responded_at: review.reviewReply?.updateTime || null,
        response_source: responseSource,
        review_photo_urls: googleReviewPhotoUrls(review),
        google_attribute_chips: googleAttributeChips(review),
        google_place_context: googlePlaceContext(review),
        is_visible: true,
    };

    const { data: upserted, error: upsertError } = await admin
        .from("reviews")
        .upsert(reviewData, { onConflict: "business_id, platform, external_id" })
        .select("id, sentiment, text, created_at")
        .single();

    let upsertedOk = false;
    let needsAnalysis = false;
    let isNew = false;

    if (upsertError) {
        console.error("Upsert Error:", upsertError);
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

        if (
            reviewQualifiesForAutoReplyEnqueue(review, numericRating, autoReplySettings, upserted?.id)
        ) {
            try {
                await enqueueAutoReplyJob(upserted!.id);
            } catch (e) {
                console.error("[AutoReply] Failed to enqueue job:", e);
            }
        }
    }

    return { upserted: upsertedOk, id: upserted?.id, needsAnalysis, isNew, error: upsertError };
}

