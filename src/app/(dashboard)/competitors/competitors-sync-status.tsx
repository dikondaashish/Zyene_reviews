"use client";

import { CircleAlert, RefreshCw } from "lucide-react";
import { TimeAgo } from "@/components/ui/time-ago";
import type { CompetitorWatchRun } from "./competitors-types";

/** One quiet line instead of a diagnostics card; only a failure earns more space. */
export function CompetitorsSyncStatus({ latestRun, latestSuccessRun }: {
    latestRun: CompetitorWatchRun | null;
    latestSuccessRun: CompetitorWatchRun | null;
}) {
    const failed = latestRun && String(latestRun.status).toLowerCase() === "failed";
    if (failed) {
        return (
            <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                    The last update from Google didn&apos;t work
                    {latestSuccessRun ? <>, so numbers are from <TimeAgo date={latestSuccessRun.finished_at} /></> : null}. Try &ldquo;Refresh now&rdquo;.
                </span>
            </p>
        );
    }
    return (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="size-3.5" aria-hidden />
            {latestSuccessRun
                ? <span>Updated from Google <TimeAgo date={latestSuccessRun.finished_at} /> · refreshes every day</span>
                : <>Ratings refresh from Google every day. The first update can take a few minutes after you add a competitor.</>}
        </p>
    );
}
