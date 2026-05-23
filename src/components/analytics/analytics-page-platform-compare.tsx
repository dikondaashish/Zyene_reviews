"use client";

import { Suspense } from "react";
import type { AnalyticsFullRangePayload } from "@/lib/analytics/build-analytics-range-payload";
import { AnalyticsPlatformTable } from "@/components/analytics/analytics-charts-registry";

export function AnalyticsPagePlatformCompare({ d }: { d: AnalyticsFullRangePayload }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Platform Comparison</h2>
                <div className="h-[1px] flex-1 bg-border/30" />
            </div>
            <Suspense fallback={<div className="h-[220px] rounded-lg bg-muted/40 animate-pulse" />}>
                <AnalyticsPlatformTable data={d.platformData} />
            </Suspense>
        </div>
    );
}
