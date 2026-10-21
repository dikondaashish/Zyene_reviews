import type { createAdminClient } from "@/lib/db/supabase/admin";
import { blockedReason, checkReviewRequestSend, type GuardChannel } from "@/lib/review-requests/send-guard";
import type { CampaignJobData } from "@/services/campaigns/campaign-job-access";

type Admin = ReturnType<typeof createAdminClient>;

/**
 * True when this campaign already holds a live request for the same contact. Keeping a
 * campaign "active" lets owners add contacts later; this stops a re-added contact (or a
 * replayed job without an event id) from getting the first message twice.
 */
export async function alreadyRequestedInCampaign(admin: Admin, job: CampaignJobData, excludeRequestId?: string): Promise<boolean> {
    for (const [column, value] of [["customer_phone", job.contact.phone], ["customer_email", job.contact.email]] as const) {
        if (!value) continue;
        let query = admin.from("review_requests").select("id")
            .eq("campaign_id", job.campaignId).eq("business_id", job.businessId).eq(column, value)
            .not("status", "in", "(skipped,failed)").limit(1);
        if (excludeRequestId) query = query.neq("id", excludeRequestId);
        const { data, error } = await query;
        if (error) throw error;
        if (data?.length) return true;
    }
    return false;
}

/** Pre-insert eligibility for a campaign contact; the send re-checks everything again. */
export async function campaignContactEligibility(admin: Admin, job: CampaignJobData, channels: GuardChannel[]) {
    if (await alreadyRequestedInCampaign(admin, job)) {
        return { allowed: false as const, channels: [] as GuardChannel[], reason: "Already requested in this campaign" };
    }
    const guard = await checkReviewRequestSend(admin, {
        businessId: job.businessId, channels, phone: job.contact.phone ?? null, email: job.contact.email ?? null,
        frequencyCap: "apply",
    });
    if (!guard.allowed.length) return { allowed: false as const, channels: [] as GuardChannel[], reason: blockedReason(guard.blocked) };
    return { allowed: true as const, channels: guard.allowed, reason: null };
}

export function campaignNotActiveReason(): string {
    return "Campaign is paused, archived or no longer accessible";
}
