"use client";

import { CampaignsPageHeader } from "./campaigns-page-header";
import { GetReviewsTabs } from "@/components/dashboard/get-reviews-tabs";
import { CampaignsTabs } from "./campaigns-tabs";
import { useCampaignsList } from "./use-campaigns-list";
import type { BusinessType } from "@/lib/campaigns/business-types";

export default function CampaignsPage({ businessId, savedBusinessType }: { businessId: string | null; savedBusinessType: BusinessType | null }) {
    const {
        campaigns,
        loading,
        toggleStatus,
        deleteCampaign,
        getCompletedPercent,
    } = useCampaignsList();

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-x-hidden">
            <GetReviewsTabs active="/campaigns" />
            <CampaignsPageHeader />
            <CampaignsTabs
                loading={loading}
                campaigns={campaigns}
                toggleStatus={toggleStatus}
                deleteCampaign={deleteCampaign}
                getCompletedPercent={getCompletedPercent}
                businessId={businessId}
                savedBusinessType={savedBusinessType}
            />
        </div>
    );
}
