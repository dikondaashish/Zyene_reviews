"use client";

import { PanelLoading } from "@/components/dashboard/panel-loading";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
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
    const searchParams = useSearchParams();
    const urlTab = searchParams.get("tab") === "templates" ? "templates" : "all";
    const [activeTab, setActiveTab] = useState(urlTab);
    const [seenUrlTab, setSeenUrlTab] = useState(urlTab);
    // A link or back/forward that changes ?tab= still moves the tabs.
    if (urlTab !== seenUrlTab) {
        setSeenUrlTab(urlTab);
        setActiveTab(urlTab);
    }
    // Both tabs' data is already loaded, so switch at once and only note the tab in the URL.
    // router.replace would re-render the whole page on the server first, making clicks feel dead.
    const changeTab = (value: string) => {
        const tab = value === "templates" ? "templates" : "all";
        setActiveTab(tab);
        setSeenUrlTab(tab);
        const params = new URLSearchParams(window.location.search);
        if (tab === "templates") params.set("tab", tab);
        else params.delete("tab");
        window.history.replaceState(window.history.state, "", `/campaigns${params.size ? `?${params}` : ""}`);
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
