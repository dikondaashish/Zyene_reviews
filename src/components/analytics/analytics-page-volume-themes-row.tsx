"use client";

import { ChartColumnIncreasing, ListFilter } from "lucide-react";
import type { AnalyticsFullRangePayload } from "@/lib/analytics/build-analytics-range-payload";
import { AnalyticsChartCard } from "@/components/analytics/analytics-chart-card";
import { AnalyticsVolumeChart, AnalyticsThemeChart } from "@/components/analytics/analytics-charts-registry";

export function AnalyticsPageVolumeThemesRow({ d }: { d: AnalyticsFullRangePayload }) {
    return <div className="grid gap-5 xl:grid-cols-3">
        <AnalyticsChartCard title="Review volume" description="Review activity, broken down by rating" icon={ChartColumnIncreasing} className="xl:col-span-2">
            <AnalyticsVolumeChart data={d.trendData} />
        </AnalyticsChartCard>
        <AnalyticsChartCard title="Common themes" description="What customers mention most often" icon={ListFilter}>
            <AnalyticsThemeChart data={d.themeData} />
        </AnalyticsChartCard>
    </div>;
}
