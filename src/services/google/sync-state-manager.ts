import { createAdminClient } from "@/lib/db/supabase/admin";
import type { Json } from "@/lib/db/supabase/database.types";

export type SyncState = {
    last_sync_status?: "partial" | "complete" | "failed";
    last_page_cursor?: string | null;
    reviews_processed?: number;
    last_error?: string | null;
    /** High-water mark stored on `review_platforms.last_review_update_time` */
    last_review_update_time?: string | null;
};

function asObject(value: unknown): Record<string, unknown> {
    if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
    return {};
}

export class SyncStateManager {
    async getSyncState(platformId: string): Promise<SyncState | null> {
        const admin = createAdminClient();
        const { data, error } = await admin
            .from("review_platforms")
            .select("sync_state,last_review_update_time")
            .eq("id", platformId)
            .maybeSingle();

        if (error || !data) return null;

        const lastReviewUpdateTime = data.last_review_update_time ?? null;
        const syncStateRaw = data.sync_state ?? null;

        if (lastReviewUpdateTime == null && syncStateRaw == null) {
            return null;
        }

        const syncStateObj = asObject(syncStateRaw);
        return {
            ...(syncStateObj as SyncState),
            last_review_update_time: lastReviewUpdateTime,
        };
    }

    async beginSync(platformId: string): Promise<void> {
        const admin = createAdminClient();
        const { data } = await admin
            .from("review_platforms")
            .select("sync_state")
            .eq("id", platformId)
            .maybeSingle();

        const next: Record<string, unknown> = {
            ...asObject(data?.sync_state),
            last_sync_status: "partial",
        };

        await admin.from("review_platforms").update({ sync_state: next as Json }).eq("id", platformId);
    }

    async checkpointSync(platformId: string, cursor: string, reviewsProcessed: number): Promise<void> {
        const admin = createAdminClient();
        const { data } = await admin
            .from("review_platforms")
            .select("sync_state")
            .eq("id", platformId)
            .maybeSingle();

        const next: Record<string, unknown> = {
            ...asObject(data?.sync_state),
            last_page_cursor: cursor,
            reviews_processed: reviewsProcessed,
        };

        await admin.from("review_platforms").update({ sync_state: next as Json }).eq("id", platformId);
    }

    async completeSync(platformId: string, newHighWaterMark: string, totalReviews: number): Promise<void> {
        const admin = createAdminClient();
        const { data } = await admin
            .from("review_platforms")
            .select("sync_state")
            .eq("id", platformId)
            .maybeSingle();

        const next: Record<string, unknown> = {
            ...asObject(data?.sync_state),
            last_sync_status: "complete",
            last_page_cursor: null,
            reviews_processed: totalReviews,
            last_error: null,
        };

        await admin
            .from("review_platforms")
            .update({
                last_review_update_time: newHighWaterMark,
                sync_state: next as Json,
            })
            .eq("id", platformId);
    }

    async failSync(platformId: string, error: string): Promise<void> {
        const admin = createAdminClient();
        const { data } = await admin
            .from("review_platforms")
            .select("sync_state")
            .eq("id", platformId)
            .maybeSingle();

        const next: Record<string, unknown> = {
            ...asObject(data?.sync_state),
            last_sync_status: "failed",
            last_error: error,
        };

        await admin.from("review_platforms").update({ sync_state: next as Json }).eq("id", platformId);
    }
}

