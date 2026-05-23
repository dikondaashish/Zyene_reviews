"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TimeAgo } from "@/components/ui/time-ago";
import type { Competitor, CompetitorEvent } from "./competitors-types";

export function CompetitorsTableEventsSection({
    competitors,
    activeEventRows,
    rangeLabel,
}: {
    competitors: Competitor[];
    activeEventRows: CompetitorEvent[];
    rangeLabel: string;
}) {
    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle>Recent Competitor Events ({rangeLabel})</CardTitle>
                <CardDescription>
                    Event timeline generated from competitor monitoring workflows.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {activeEventRows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No events recorded in this period yet.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {activeEventRows.slice(0, 20).map((event) => {
                            const competitorName =
                                competitors.find((c) => c.id === event.competitor_id)?.name ||
                                "Competitor";
                            return (
                                <div key={event.id} className="min-w-0 rounded-lg border p-3">
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                                        <p className="min-w-0 flex-1 break-words text-sm font-medium leading-snug">
                                            {event.title || event.event_type}
                                        </p>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            <TimeAgo date={event.created_at} />
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{competitorName}</p>
                                    {event.summary ? (
                                        <p className="text-sm mt-1">{event.summary}</p>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
