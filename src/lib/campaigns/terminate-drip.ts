import { createAdminClient } from "@/lib/db/supabase/admin";
import type { DripTerminatedReason } from "@/lib/campaigns/drip-phase1";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Stop remaining drip steps. Idempotent for non-active rows (no-op update match).
 */
export async function terminateReviewRequestDrip(
    admin: AdminClient,
    requestId: string,
    reason: DripTerminatedReason,
): Promise<void> {
    await admin
        .from("review_requests")
        .update({
            drip_status: "terminated",
            drip_terminated_reason: reason,
        })
        .eq("id", requestId)
        .eq("drip_status", "active");
}
