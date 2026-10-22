import { CheckCircle, Eye, MousePointerClick, Send, Star } from "lucide-react";
import type { StepFunnelStage } from "@/components/metrics/step-funnel";
import type { Campaign } from "./campaign-detail-types";

export function buildCampaignFunnelStages(campaign: Campaign | null): StepFunnelStage[] {
    if (!campaign) return [];
    // "Responded" = handed off to Google or left private feedback (not proof of a review).
    // "Reviews you confirmed" counts only reviews a team member confirmed.
    const stages: StepFunnelStage[] = [
        { key: "asked", label: "Asked", value: campaign.total_sent, icon: Send },
        { key: "opened", label: "Opened the email", value: campaign.total_opened, icon: Eye },
        { key: "clicked", label: "Clicked the link", value: campaign.total_clicked, icon: MousePointerClick },
        { key: "responded", label: "Responded", value: campaign.total_completed || 0, icon: CheckCircle, hint: "Went on to Google or left you private feedback." },
        { key: "confirmed", label: "Reviews you confirmed", value: campaign.total_reviews_received || 0, icon: Star },
    ];
    // Text messages can't report an "open", so a texts-only campaign would always show 0 there.
    return campaign.channel === "sms" ? stages.filter((s) => s.key !== "opened") : stages;
}
