"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TimeAgo } from "@/components/ui/time-ago";
import type { CompetitorWatchRun } from "./competitors-types";

function runStatusVariant(status: string): "default" | "destructive" | "secondary" {
    const s = String(status || "").toLowerCase();
    if (s === "failed") return "destructive";
    if (s === "success") return "default";
    return "secondary";
}

const STALE_MS = 24 * 60 * 60 * 1000;

function SyncStaleHint({ finishedAt }: { finishedAt: string }) {
    const [stale] = useState(
        () => Date.now() - new Date(finishedAt).getTime() > STALE_MS,
    );
    return stale ? " Data may be stale (>24h)." : "";
}

type CompetitorsListSyncHealthCardProps = {
    latestRun: CompetitorWatchRun | null;
    latestSuccessRun: CompetitorWatchRun | null;
    latestFailedRun: CompetitorWatchRun | null;
};

export function CompetitorsListSyncHealthCard({
    latestRun,
    latestSuccessRun,
    latestFailedRun,
}: CompetitorsListSyncHealthCardProps) {
    return (
            <Card>
                <CardHeader>
                    <CardTitle>Last Sync Health</CardTitle>
                    <CardDescription>
                        Scheduled job status for this business. Use &quot;Sync from Google&quot; above to refresh
                        ratings without waiting for the schedule (requires a server Google Maps API key).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!latestRun ? (
                        <p className="text-sm text-muted-foreground">
                            No sync run has been logged yet for this business.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <Badge variant={runStatusVariant(latestRun.status)}>
                                    {String(latestRun.status || "unknown").toUpperCase()}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    Finished <TimeAgo date={latestRun.finished_at} />
                                </span>
                                {latestSuccessRun ? (
                                    <span className="text-xs text-muted-foreground">
                                        Last success <TimeAgo date={latestSuccessRun.finished_at} />
                                    </span>
                                ) : null}
                                {latestFailedRun ? (
                                    <span className="text-xs text-muted-foreground">
                                        Last failure <TimeAgo date={latestFailedRun.finished_at} />
                                    </span>
                                ) : null}
                            </div>
                            <div className="grid grid-cols-1 gap-2 text-sm min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                                <div className="min-w-0 rounded border p-2">
                                    <p className="text-muted-foreground text-xs">Scanned</p>
                                    <p className="font-semibold">{latestRun.scanned}</p>
                                </div>
                                <div className="rounded border p-2">
                                    <p className="text-muted-foreground text-xs">External updates</p>
                                    <p className="font-semibold">{latestRun.external_updates}</p>
                                </div>
                                <div className="rounded border p-2">
                                    <p className="text-muted-foreground text-xs">Snapshots</p>
                                    <p className="font-semibold">{latestRun.snapshots_created}</p>
                                </div>
                                <div className="rounded border p-2">
                                    <p className="text-muted-foreground text-xs">Events</p>
                                    <p className="font-semibold">{latestRun.events_created}</p>
                                </div>
                                <div className="rounded border p-2">
                                    <p className="text-muted-foreground text-xs">Insights</p>
                                    <p className="font-semibold">{latestRun.insights_created}</p>
                                </div>
                            </div>
                            {latestRun.error_message ? (
                                <p className="text-xs text-sync-action dark:text-sync-action">
                                    {latestRun.error_message}
                                </p>
                            ) : null}
                            {latestSuccessRun ? (
                                <p className="text-xs text-muted-foreground">
                                    Data freshness: latest successful sync was <TimeAgo date={latestSuccessRun.finished_at} />.
                                    <SyncStaleHint
                                        key={latestSuccessRun.finished_at}
                                        finishedAt={latestSuccessRun.finished_at}
                                    />
                                </p>
                            ) : null}
                        </div>
                    )}
                </CardContent>
            </Card>
    );
}
