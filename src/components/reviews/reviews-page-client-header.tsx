"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2 } from "lucide-react";
import { SyncButton } from "@/components/dashboard/sync-button";
import { AutoReplyToolbar, type AutoReplySettingsState } from "./auto-reply-toolbar";

interface ReviewsPageClientHeaderProps {
    count: number;
    isDemo: boolean;
    businessId: string;
    exportType: string;
    isGoogleConnected: boolean;
    autoCommenterPlanOk: boolean;
    autoReplyInitial: AutoReplySettingsState;
}

export function ReviewsPageClientHeader({
    count,
    isDemo,
    businessId,
    exportType,
    isGoogleConnected,
    autoCommenterPlanOk,
    autoReplyInitial,
}: ReviewsPageClientHeaderProps) {
    return (
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
                <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight sm:gap-3 sm:text-2xl">
                    Reviews
                    <span className="rounded-full bg-muted px-2 py-0.5 text-sm font-normal text-muted-foreground">
                        {count || 0}
                    </span>
                    {isDemo && (
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1 border-primary/30 bg-primary/10 px-2.5 py-0.5 font-normal tracking-tight text-primary"
                        >
                            <Eye className="h-3 w-3" />
                            Interactive Demo
                        </Badge>
                    )}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">Manage and respond to your customer reviews.</p>
            </div>
            <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:items-end">
                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
                    <Button variant="outline" className="w-full sm:w-auto" asChild>
                        <a
                            href={`/api/reviews/export?type=${exportType}`}
                            className="flex w-full items-center justify-center"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            <span className="sm:hidden">Export</span>
                            <span className="hidden sm:inline">Export CSV</span>
                        </a>
                    </Button>
                    <div className="w-full sm:w-auto [&_button]:w-full sm:[&_button]:w-auto">
                        <SyncButton businessId={businessId} />
                    </div>
                </div>
                {isGoogleConnected && (
                    <AutoReplyToolbar
                        businessId={businessId}
                        googleConnected={isGoogleConnected}
                        planAllowsAutoCommenter={autoCommenterPlanOk}
                        initial={autoReplyInitial}
                    />
                )}
            </div>
        </div>
    );
}
