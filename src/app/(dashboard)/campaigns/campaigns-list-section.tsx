"use client";

import type { Campaign } from "./campaigns-list-types";
import { CampaignRow } from "./campaign-row";

const STATUS_ORDER: Record<string, number> = { active: 0, processing: 0, paused: 1, draft: 2 };

/** Running campaigns first, then paused, then drafts, so the ones doing work are on top. */
export function CampaignsListSection({
    campaigns,
    toggleStatus,
    deleteCampaign,
    getCompletedPercent,
}: {
    campaigns: Campaign[];
    toggleStatus: (campaign: Campaign) => void;
    deleteCampaign: (id: string) => void;
    getCompletedPercent: (c: Campaign) => number;
}) {
    const ordered = [...campaigns].sort((a, b) => (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3));
    return (
        <ul aria-label="Your campaigns" className="divide-y divide-border overflow-hidden rounded-xl border border-border/70 bg-card">
            {ordered.map((campaign) => (
                <CampaignRow
                    key={campaign.id}
                    campaign={campaign}
                    responseRate={getCompletedPercent(campaign)}
                    onToggle={() => toggleStatus(campaign)}
                    onDelete={() => deleteCampaign(campaign.id)}
                />
            ))}
        </ul>
    );
}
