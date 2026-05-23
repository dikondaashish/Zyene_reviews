import { CheckCircle, Eye, MousePointerClick, Send } from "lucide-react";
import type { Campaign, FunnelStage } from "./campaign-detail-types";

export function buildCampaignFunnelStages(campaign: Campaign | null): FunnelStage[] {
    if (!campaign) return [];
    const totalCompleted = campaign.total_completed || campaign.total_reviews_received || 0;
    return [
        { label: "Sent", value: campaign.total_sent, icon: Send, color: "bg-primary" },
        { label: "Opened", value: campaign.total_opened, icon: Eye, color: "bg-chart-4" },
        { label: "Clicked", value: campaign.total_clicked, icon: MousePointerClick, color: "bg-primary" },
        { label: "Completed", value: totalCompleted, icon: CheckCircle, color: "bg-chart-2/100" },
    ];
}

export function campaignMaxFunnel(campaign: Campaign | null) {
    return Math.max(campaign?.total_sent ?? 0, 1);
}
