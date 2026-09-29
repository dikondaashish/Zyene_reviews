"use client";

import { Suspense } from "react";
import { PanelLoading } from "@/components/dashboard/panel-loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MousePointer2 } from "lucide-react";
import type { AnalyticsFullRangePayload } from "@/lib/analytics/build-analytics-range-payload";
import {
    AnalyticsEngagementFunnelCard,
    AnalyticsGooglePerformanceProfileChart,
} from "@/components/analytics/analytics-charts-registry";

export function AnalyticsPageGooglePerformanceSection({
    d,
    perfTotals,
}: {
    d: AnalyticsFullRangePayload;
    perfTotals: {
        profileViews?: number;
        websiteClicks?: number;
        callClicks?: number;
        directionRequests?: number;
    } | null;
}) {
    return (
        <>
            <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">Google Business insights</h2>
                <p className="text-sm text-muted-foreground">Understand how people find and interact with your business.</p>
            </div>

            <div className="flex flex-col gap-6">
                <Card className="rounded-xl border-border bg-card overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <MousePointer2 className="text-primary size-5" />
                                Listing Performance
                            </CardTitle>
                            <p className="text-xs text-muted-foreground font-medium">
                                Daily metrics from Google Business Profile Performance ({d.rangeLabel})
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="pb-1">
                        <Suspense fallback={<PanelLoading className="h-[260px]" />}>
                            <AnalyticsGooglePerformanceProfileChart data={d.perfSeries as never[]} />
                        </Suspense>
                    </CardContent>
                </Card>

                <Suspense fallback={<PanelLoading className="h-[220px]" />}>
                    <AnalyticsEngagementFunnelCard
                        profileViews={perfTotals?.profileViews ?? 0}
                        websiteClicks={perfTotals?.websiteClicks ?? 0}
                        callClicks={perfTotals?.callClicks ?? 0}
                        directionRequests={perfTotals?.directionRequests ?? 0}
                    />
                </Suspense>
            </div>
        </>
    );
}
