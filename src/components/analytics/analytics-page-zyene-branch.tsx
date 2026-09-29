"use client";

import { Suspense } from "react";
import { PanelLoading } from "@/components/dashboard/panel-loading";
import type { AnalyticsFullRangePayload } from "@/lib/analytics/build-analytics-range-payload";
import { AnalyticsZyenePlatformAnalytics } from "@/components/analytics/analytics-charts-registry";

export function AnalyticsPageZyeneBranch({ d }: { d: AnalyticsFullRangePayload }) {
    return (
        <Suspense fallback={<PanelLoading className="h-[420px]" />}>
            <AnalyticsZyenePlatformAnalytics
                requests={(d.allRequests || []) as never[]}
                previousRequests={(d.previousRequests || []) as never[]}
                privateFeedback={d.privateFeedback as never}
                dateRange={d.rangeLabel}
            />
        </Suspense>
    );
}
