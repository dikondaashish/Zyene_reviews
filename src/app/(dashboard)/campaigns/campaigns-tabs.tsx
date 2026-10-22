"use client";

import { PanelLoading } from "@/components/dashboard/panel-loading";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BusinessType } from "@/lib/campaigns/business-types";
import { TemplateLibrary } from "./template-library";
import { CampaignsEmptyState } from "./campaigns-empty-state";
import { CampaignsListSection } from "./campaigns-list-section";
import { CampaignsSummary } from "./campaigns-summary";
import type { Campaign } from "./campaigns-list-types";

export function CampaignsTabs({
    loading,
    campaigns,
    toggleStatus,
    deleteCampaign,
    getCompletedPercent,
    businessId,
    savedBusinessType,
}: {
    loading: boolean;
    campaigns: Campaign[];
    toggleStatus: (campaign: Campaign) => void;
    deleteCampaign: (id: string) => void;
    getCompletedPercent: (c: Campaign) => number;
    businessId: string | null;
    savedBusinessType: BusinessType | null;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") === "templates" ? "templates" : "all";
    const changeTab = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "templates") params.set("tab", value);
        else params.delete("tab");
        router.replace(`/campaigns${params.size ? `?${params}` : ""}`, { scroll: false });
    };
    return (
        <Tabs value={activeTab} onValueChange={changeTab} className="w-full">
            <TabsList variant="line" className="mb-4 w-full min-w-0 justify-start border-b border-border">
                <TabsTrigger value="all">Your campaigns</TabsTrigger>
                <TabsTrigger value="templates">Ready-made templates</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
                {loading && (
                    <PanelLoading label="campaigns" className="h-80 rounded-xl border border-border bg-card" />
                )}

                {!loading && campaigns.length === 0 && <CampaignsEmptyState />}

                {!loading && campaigns.length > 0 && <CampaignsSummary campaigns={campaigns} />}

                {!loading && campaigns.length > 0 && (
                    <CampaignsListSection
                        campaigns={campaigns}
                        toggleStatus={toggleStatus}
                        deleteCampaign={deleteCampaign}
                        getCompletedPercent={getCompletedPercent}
                    />
                )}
            </TabsContent>

            <TabsContent value="templates">
                <TemplateLibrary key={businessId ?? "none"} businessId={businessId} savedBusinessType={savedBusinessType} active={activeTab === "templates"} />
            </TabsContent>
        </Tabs>
    );
}
