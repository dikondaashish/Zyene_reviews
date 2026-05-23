"use client";

import { Star, Clock } from "lucide-react";
import { googleCardTimeAgo } from "@/components/integrations/google-card-time-ago";

export function GoogleIntegrationCardSyncStatsRow({
    mounted,
    displayReviewCount,
    displayLastSyncedAt,
}: {
    mounted: boolean;
    displayReviewCount: number;
    displayLastSyncedAt: string | null;
}) {
    return (
        <>
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                        <Star className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium uppercase tracking-wide">Reviews Synced</span>
                    </div>
                    <p className="text-xl font-bold">{displayReviewCount}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium uppercase tracking-wide">Last Synced</span>
                    </div>
                    <p className="text-sm font-semibold mt-1">
                        {!mounted ? "..." : displayLastSyncedAt ? googleCardTimeAgo(displayLastSyncedAt) : "Never"}
                    </p>
                </div>
            </div>
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Listing performance (views, calls, directions, site clicks) and monthly search keywords sync with Sync
                or the daily cron.
            </p>
        </>
    );
}
