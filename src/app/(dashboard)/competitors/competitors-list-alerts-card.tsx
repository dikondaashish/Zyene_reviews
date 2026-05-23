"use client";

import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TimeAgo } from "@/components/ui/time-ago";
import type { CompetitorEvent } from "./competitors-types";

type CompetitorsListAlertsCardProps = {
    alertEvents: CompetitorEvent[];
    rangeLabel: string;
};

export function CompetitorsListAlertsCard({ alertEvents, rangeLabel }: CompetitorsListAlertsCardProps) {
    if (alertEvents.length === 0) return null;

    return (
                <Card id="competitor-alerts">
                    <CardHeader>
                        <CardTitle>Threshold alerts ({rangeLabel})</CardTitle>
                        <CardDescription>
                            Fired when a competitor crosses your{" "}
                            <Link href="/settings/competitor-alerts" className="text-primary underline underline-offset-2">
                                alert thresholds
                            </Link>
                            . Emails go to team members with email notifications enabled.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {alertEvents.slice(0, 15).map((ev) => (
                                <li key={ev.id} className="flex min-w-0 flex-col gap-1 rounded-lg border p-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                                    <span className="break-words font-medium">{ev.title}</span>
                                    <span className="shrink-0 text-xs text-muted-foreground sm:text-right">
                                        <TimeAgo date={ev.created_at} />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
    );
}
