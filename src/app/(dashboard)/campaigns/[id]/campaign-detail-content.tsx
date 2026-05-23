"use client";

import { CSVImportDialog } from "@/components/campaigns/csv-import-dialog";
import { CampaignDetailContacts } from "./campaign-detail-contacts";
import { CampaignDetailFunnel } from "./campaign-detail-funnel";
import { CampaignDetailHeader } from "./campaign-detail-header";
import { CampaignDetailStats } from "./campaign-detail-stats";
import type { CampaignDetailState } from "./use-campaign-detail";

interface CampaignDetailContentProps {
    detail: CampaignDetailState;
}

export function CampaignDetailContent({ detail }: CampaignDetailContentProps) {
    const { campaign, requests, mounted, funnelStages, maxFunnel, csvDialogOpen, setCsvDialogOpen, handleCSVImport, sending } = detail;

    if (!campaign) return null;

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-x-hidden p-4 sm:p-6">
            <CampaignDetailHeader campaign={campaign} detail={detail} />
            <CampaignDetailStats funnelStages={funnelStages} />
            <CampaignDetailFunnel funnelStages={funnelStages} maxFunnel={maxFunnel} />
            <CampaignDetailContacts requests={requests} mounted={mounted} />
            <CSVImportDialog
                open={csvDialogOpen}
                onOpenChange={setCsvDialogOpen}
                onImport={handleCSVImport}
                isImporting={sending}
            />
        </div>
    );
}
