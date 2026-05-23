"use client";

import { Suspense } from "react";
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
            <div className="flex items-center gap-3 mt-4">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Google Business Insights
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
            </div>

            <div className="flex flex-col gap-6">
                <Card className="bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20 overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <MousePointer2 className="text-primary size-5" />
                                Listing Performance
                            </CardTitle>
                            <p className="text-xs text-muted-foreground font-medium">
                                Daily metrics from Google Business Profile Performance ({d.rangeLabel})
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="pl-0 pb-6">
                        <Suspense fallback={<div className="h-[260px] rounded-lg bg-muted/40 animate-pulse" />}>
                            <AnalyticsGooglePerformanceProfileChart data={d.perfSeries as never[]} />
                        </Suspense>
                    </CardContent>
                </Card>

                <Suspense fallback={<div className="h-[220px] rounded-lg bg-muted/40 animate-pulse" />}>
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
