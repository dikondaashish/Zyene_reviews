"use client";

import { CampaignsPageHeader } from "./campaigns-page-header";
import { CampaignsTabs } from "./campaigns-tabs";
import { useCampaignsList } from "./use-campaigns-list";

export default function CampaignsPage() {
    const {
        campaigns,
        loading,
        toggleStatus,
        deleteCampaign,
        getOpenedPercent,
        getCompletedPercent,
    } = useCampaignsList();

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-x-hidden p-4 sm:p-6">
            <CampaignsPageHeader />
            <CampaignsTabs
                loading={loading}
                campaigns={campaigns}
                toggleStatus={toggleStatus}
                deleteCampaign={deleteCampaign}
                getOpenedPercent={getOpenedPercent}
                getCompletedPercent={getCompletedPercent}
            />
        </div>
    );
}
