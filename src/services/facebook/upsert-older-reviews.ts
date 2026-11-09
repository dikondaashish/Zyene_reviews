import { logger } from "@/lib/logger";
import type { createAdminClient } from "@/lib/db/supabase/admin";
import type { NormalizedFacebookReview } from "./adapter";

const OLDER_REVIEW_UPSERT_CHUNK = 25;

/** Upserts older ratings in small batches; one failed batch is logged, not fatal. */
export async function upsertOlderFacebookReviews(
    admin: ReturnType<typeof createAdminClient>,
    platform: { id: string; business_id: string },
    reviews: NormalizedFacebookReview[],
): Promise<void> {
    for (let i = 0; i < reviews.length; i += OLDER_REVIEW_UPSERT_CHUNK) {
        const rows = reviews.slice(i, i + OLDER_REVIEW_UPSERT_CHUNK).map((review) => ({
            business_id: platform.business_id,
            platform: "facebook" as const,
            platform_id: platform.id,
            external_id: review.externalId,
            author_name: review.authorName,
            rating: review.rating,
            text: review.content,
            review_date: review.publishedAt,
        }));
        const { error } = await admin.from("reviews").upsert(rows, { onConflict: "business_id, platform, external_id" });
        if (error) {
            logger.error({ err: error, platformId: platform.id }, "[Facebook Sync] Older reviews upsert failed");
        }
    }
}
