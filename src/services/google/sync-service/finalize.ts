/** Google review sync — finalize */

import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import { AI_ANALYSIS_BATCH_SIZE } from "../constants";

/**
 * Step 3: Finalize sync (Update stats, clear lock).
 */
export async function finalizeGoogleSync(
    platformId: string, 
    businessId: string, 
    _finalTotal?: number, 
    _finalAvg?: number
) {
    const admin = createAdminClient();

    /** Roll up from DB only — Google API `totalReviewCount` can be 0 for wrong listing while rows exist here, and `0 ?? dbCount` would incorrectly keep 0. */
    const { data: ratingRows, error: rollupErr } = await admin
        .from("reviews")
        .select("rating")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .eq("is_visible", true);

    if (rollupErr) {
        console.error("[Sync] Finalize rollup select failed:", rollupErr);
    }

    const list = ratingRows || [];
    const total = list.length;
    const avg = total > 0 ? list.reduce((s, r) => s + Number(r.rating ?? 0), 0) / total : 0;
    const avgRounded = parseFloat(avg.toFixed(1));

    const updateData = {
        total_reviews: total,
        average_rating: avgRounded,
        sync_status: 'idle',
        last_synced_at: new Date().toISOString(),
        locked_until: null
    };

    await admin.from("review_platforms").update(updateData).eq("id", platformId);
    
    // Update business summary
    try {
        await admin.from("businesses").update({
            total_reviews: total,
            average_rating: avgRounded
        }).eq("id", businessId);
    } catch (e) {
        console.error("[Sync] Finalize failed for business summary update:", e);
    }
}

/**
 * Backfill queue for existing reviews that still miss AI analysis.
 * This is useful when AI was temporarily misconfigured and older rows were never analyzed.
 */
export async function enqueueMissingGoogleReviewAnalysis(
    businessId: string,
    limit = 2000
): Promise<{ queued: number }> {
    const admin = createAdminClient();

    const { data, error } = await admin
        .from("reviews")
        .select("id")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .eq("is_visible", true)
        .is("sentiment", null)
        .not("text", "is", null)
        .neq("text", "")
        .limit(limit);

    if (error) {
        console.error("[Sync] Failed to fetch missing AI analysis rows:", error);
        return { queued: 0 };
    }

    const ids = (data || []).map((row: { id: string }) => row.id);
    if (ids.length === 0) {
        return { queued: 0 };
    }

    for (let i = 0; i < ids.length; i += AI_ANALYSIS_BATCH_SIZE) {
        const chunk = ids.slice(i, i + AI_ANALYSIS_BATCH_SIZE);
        await inngest.send({
            name: "review/analyze.batch",
            data: { reviewIds: chunk }
        });
    }

    return { queued: ids.length };
}

