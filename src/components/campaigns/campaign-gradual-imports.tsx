"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CampaignGradualImportUpload } from "./campaign-gradual-import-upload";
import { CampaignImportProgress } from "./campaign-import-progress";
import { useGradualImport } from "./use-gradual-import";

/** Gradual CSV enrollment: add a list that is enrolled a few contacts per day. */
export function CampaignGradualImports({
    campaignId, channel, campaignStatus,
}: {
    campaignId: string;
    channel: "sms" | "email" | "both";
    campaignStatus: string;
}) {
    const state = useGradualImport(campaignId, channel);
    const [showUpload, setShowUpload] = useState(false);
    const closed = campaignStatus === "archived" || campaignStatus === "completed";

    return (
        <section className="space-y-4 rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <h2 className="ui-section-title">Gradual import</h2>
                    <p className="text-sm text-muted-foreground">
                        Upload a customer list and enroll a set number per day, so requests (and new reviews) arrive steadily.
                    </p>
                </div>
                {!closed && !showUpload && <Button variant="outline" size="sm" onClick={() => setShowUpload(true)}>Upload CSV</Button>}
            </div>
            {showUpload && !closed && <CampaignGradualImportUpload state={state} campaignActive={campaignStatus === "active"} />}
            <CampaignImportProgress imports={state.imports} onUpdate={state.update} />
        </section>
    );
}
