import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { buildWaitingTasks, type WaitingTask } from "@/lib/dashboard/waiting-tasks";
import { loadSetupProgress } from "@/services/automations/load-setup-progress";

/** Loads the dashboard task list with the caller's RLS client. Fails soft to no tasks. */
export async function loadWaitingTasks(
    supabase: SupabaseClient,
    input: { businessId: string; googleConnected: boolean; brokenLinks: number },
): Promise<WaitingTask[]> {
    try {
        const [drafts, lowRatings, setup] = await Promise.all([
            supabase.from("review_reply_drafts").select("id", { count: "exact", head: true })
                .eq("business_id", input.businessId).in("status", ["pending", "failed"]),
            supabase.from("reviews").select("id", { count: "exact", head: true })
                .eq("business_id", input.businessId).eq("is_visible", true)
                .eq("response_status", "pending").lte("rating", 2),
            loadSetupProgress(supabase, input.businessId, input.googleConnected),
        ]);
        return buildWaitingTasks({
            pendingApprovals: drafts.count ?? 0,
            unansweredLowRatings: lowRatings.count ?? 0,
            brokenLinks: input.brokenLinks,
            setup,
        });
    } catch (err) {
        logger.warn({ err, businessId: input.businessId }, "[dashboard] waiting tasks load failed");
        return [];
    }
}
