import type { createAdminClient } from "@/lib/db/supabase/admin";
import type { DripCampaignRow, DripRequestRow } from "@/lib/campaigns/drip-phase1-types";
import { shouldSkipDripSend } from "@/lib/campaigns/drip-phase1";

export const DRIP_REQUEST_SELECT =
    "id, business_id, campaign_id, customer_name, customer_email, customer_phone, drip_status, drip_steps_sent, review_left, clicked_at, completed_at, last_drip_channel, sent_at, step2_sent_at";
export const DRIP_CAMPAIGN_SELECT =
    "id, business_id, status, follow_up_enabled, follow_up_template, drip_step3_template, drip_channel_alternate, channel, businesses (id, organization_id, name, sender_name)";

export async function loadDripSendContext(
    admin: ReturnType<typeof createAdminClient>, campaign: DripCampaignRow, req: DripRequestRow, step: 2 | 3,
) {
    const originalBusiness = Array.isArray(campaign.businesses) ? campaign.businesses[0] : campaign.businesses;
    if (!originalBusiness || campaign.business_id !== originalBusiness.id ||
        req.business_id !== originalBusiness.id || req.campaign_id !== campaign.id) return null;
    // Signed cron jobs authorize automatic reminders only for this live campaign and business.
    const { data: campaignData, error: campaignError } = await admin.from("campaigns")
        .select(DRIP_CAMPAIGN_SELECT).eq("id", campaign.id).eq("business_id", originalBusiness.id)
        .eq("status", "active").eq("follow_up_enabled", true).maybeSingle();
    const liveCampaign = campaignData as unknown as DripCampaignRow | null;
    const business = Array.isArray(liveCampaign?.businesses) ? liveCampaign.businesses[0] : liveCampaign?.businesses;
    if (campaignError || liveCampaign?.id !== campaign.id || !liveCampaign.follow_up_enabled || liveCampaign.status !== "active" ||
        liveCampaign.business_id !== originalBusiness.id || business?.id !== originalBusiness.id ||
        !business.organization_id) return null;
    const { data, error } = await admin.from("review_requests").select(DRIP_REQUEST_SELECT)
        .eq("id", req.id).eq("business_id", business.id).eq("campaign_id", campaign.id)
        .eq("drip_steps_sent", step - 1).maybeSingle();
    const request = data as unknown as DripRequestRow | null;
    if (error || request?.id !== req.id || request.business_id !== business.id || request.campaign_id !== campaign.id ||
        request.drip_steps_sent !== step - 1 || shouldSkipDripSend(request)) return null;
    return { campaign: liveCampaign, business, request };
}
