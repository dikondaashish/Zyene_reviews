"use client";

import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CAMPAIGN_TEMPLATES } from "@/lib/campaigns/templates";
import { CampaignTemplateCard } from "@/components/campaigns/campaign-template-card";
import { CampaignsEmptyState } from "./campaigns-empty-state";
import { CampaignsListSection } from "./campaigns-list-section";
import type { Campaign } from "./campaigns-list-types";

export function CampaignsTabs({
    loading,
    campaigns,
    toggleStatus,
    deleteCampaign,
    getOpenedPercent,
    getCompletedPercent,
}: {
    loading: boolean;
    campaigns: Campaign[];
    toggleStatus: (campaign: Campaign) => void;
    deleteCampaign: (id: string) => void;
    getOpenedPercent: (c: Campaign) => number;
    getCompletedPercent: (c: Campaign) => number;
}) {
    return (
        <Tabs defaultValue="all" className="w-full">
            <TabsList variant="line" className="mb-4 w-full min-w-0 justify-start border-b border-border">
                <TabsTrigger value="all">All Campaigns</TabsTrigger>
                <TabsTrigger value="templates">Template Library</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!loading && campaigns.length === 0 && <CampaignsEmptyState />}

                {!loading && campaigns.length > 0 && (
                    <CampaignsListSection
                        campaigns={campaigns}
                        toggleStatus={toggleStatus}
                        deleteCampaign={deleteCampaign}
                        getOpenedPercent={getOpenedPercent}
                        getCompletedPercent={getCompletedPercent}
                    />
                )}
            </TabsContent>

            <TabsContent value="templates">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    {CAMPAIGN_TEMPLATES.map((template) => (
                        <CampaignTemplateCard key={template.id} template={template} />
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    );
}
