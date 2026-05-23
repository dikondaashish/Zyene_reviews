"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { NewCampaignForm } from "./new-campaign-form";

export default function NewCampaignPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-muted-foreground size-8" />
                </div>
            }
        >
            <NewCampaignForm />
        </Suspense>
    );
}
