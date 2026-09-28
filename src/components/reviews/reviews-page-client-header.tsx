"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import { SyncButton } from "@/components/dashboard/sync-button";
import { AutoReplyToolbar, type AutoReplySettingsState } from "@/components/reviews/auto-reply-toolbar";

interface ReviewsPageClientHeaderProps {
    count: number;
    isDemo: boolean;
    businessId: string;
    exportType: string;
    isGoogleConnected: boolean;
    autoCommenterPlanOk: boolean;
    autoReplyInitial: AutoReplySettingsState;
}

export function ReviewsPageClientHeader(props: ReviewsPageClientHeaderProps) {
    return (
        <header className="space-y-5">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
                        <span className="rounded-md border border-border bg-card px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                            {props.count.toLocaleString("en-US")} total
                        </span>
                        {props.isDemo && <Badge variant="outline"><Eye className="mr-1 size-3" />Demo</Badge>}
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">Every review, one place. Turn customer feedback into a conversation.</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" asChild>
                        <a href={`/api/reviews/export?type=${props.exportType}`}><Download className="size-4" />Export CSV</a>
                    </Button>
                    <SyncButton businessId={props.businessId} />
                </div>
            </div>
            {props.isGoogleConnected && (
                <AutoReplyToolbar businessId={props.businessId} googleConnected={props.isGoogleConnected}
                    planAllowsAutoCommenter={props.autoCommenterPlanOk} initial={props.autoReplyInitial} />
            )}
        </header>
    );
}
