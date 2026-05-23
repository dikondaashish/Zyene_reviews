"use client";

import { Suspense } from "react";
import type { AnalyticsFullRangePayload } from "@/lib/analytics/build-analytics-range-payload";
import { AnalyticsZyenePlatformAnalytics } from "@/components/analytics/analytics-charts-registry";

export function AnalyticsPageZyeneBranch({ d }: { d: AnalyticsFullRangePayload }) {
    return (
        <Suspense fallback={<div className="h-[420px] rounded-xl border border-border bg-card/60 animate-pulse" />}>
            <AnalyticsZyenePlatformAnalytics
                requests={(d.allRequests || []) as never[]}
                previousRequests={(d.previousRequests || []) as never[]}
                privateFeedback={d.privateFeedback as never}
                dateRange={d.rangeLabel}
            />
        </Suspense>
    );
}
