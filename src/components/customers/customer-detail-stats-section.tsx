"use client";

import { formatDistanceToNow, parseISO } from "date-fns";
import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CustomerDetailStats } from "@/lib/customers/customer-detail-data";
import { SectionHeading } from "@/components/customers/customer-detail-helpers";

export function CustomerDetailStatsSection({
    stats,
    summaryHasNoEngagement,
}: {
    stats: CustomerDetailStats;
    summaryHasNoEngagement: boolean;
}) {
    return (
        <section>
            <SectionHeading
                icon={BarChart3}
                title="Summary"
                description="Quick stats for requests and engagement with this contact."
            />
            <Card className="overflow-hidden rounded-2xl border-border/80 shadow-sm">
                <CardContent className="p-0">
                    <div className="grid divide-y divide-border/80 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
                        <div className="px-5 py-5 sm:px-6 sm:py-6">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Requests sent
                            </p>
                            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                                {stats.totalRequestsSent}
                            </p>
                        </div>
                        <div className="px-5 py-5 sm:px-6 sm:py-6">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Reviews left
                            </p>
                            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                                {stats.reviewsLeftCount}
                            </p>
                        </div>
                        <div className="px-5 py-5 sm:px-6 sm:py-6">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Last contacted
                            </p>
                            <p className="mt-2 text-lg font-semibold leading-snug text-foreground">
                                {stats.lastContactedAt
                                    ? formatDistanceToNow(parseISO(stats.lastContactedAt), { addSuffix: true })
                                    : "Never"}
                            </p>
                        </div>
                        <div className="px-5 py-5 sm:px-6 sm:py-6">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Last request
                            </p>
                            <p className="mt-2 text-lg font-semibold leading-snug text-foreground">
                                {stats.lastRequestStatus}
                            </p>
                        </div>
                    </div>
                    {summaryHasNoEngagement ? (
                        <div className="border-t border-border/80 bg-muted/15 px-5 py-4 text-center text-sm text-muted-foreground sm:px-6">
                            No review requests or feedback recorded for this contact yet. Send a request to start the
                            timeline below.
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </section>
    );
}
