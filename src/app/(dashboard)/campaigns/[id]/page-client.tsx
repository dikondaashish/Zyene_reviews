"use client";

import { use } from "react";
import { Loader2 } from "lucide-react";
import { CampaignDetailContent } from "./campaign-detail-content";
import { useCampaignDetail } from "./use-campaign-detail";

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const detail = useCampaignDetail(resolvedParams.id);

    if (detail.loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-muted-foreground size-8" />
            </div>
        );
    }

    if (!detail.campaign) return null;

    return <CampaignDetailContent detail={detail} />;
}
