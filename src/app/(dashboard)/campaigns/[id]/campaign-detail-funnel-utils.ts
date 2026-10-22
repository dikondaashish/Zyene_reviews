import { CheckCircle, Eye, MousePointerClick, Send, Star } from "lucide-react";
import type { Campaign, FunnelStage } from "./campaign-detail-types";

export function buildCampaignFunnelStages(campaign: Campaign | null): FunnelStage[] {
    if (!campaign) return [];
    // "Finished page" = handed off to Google or left private feedback (not proof of a review).
    // "Confirmed reviews" counts only reviews a team member confirmed.
    return [
        { label: "Asked", value: campaign.total_sent, icon: Send, color: "bg-primary" },
        { label: "Opened", value: campaign.total_opened, icon: Eye, color: "bg-chart-4" },
        { label: "Clicked the link", value: campaign.total_clicked, icon: MousePointerClick, color: "bg-primary" },
        { label: "Responded", value: campaign.total_completed || 0, icon: CheckCircle, color: "bg-chart-2/100" },
        { label: "Reviews you confirmed", value: campaign.total_reviews_received || 0, icon: Star, color: "bg-chart-4" },
    ];
}

export function campaignMaxFunnel(campaign: Campaign | null) {
    return Math.max(campaign?.total_sent ?? 0, 1);
}
