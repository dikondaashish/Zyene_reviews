"use client";

import { ChartNoAxesCombined, ChartPie } from "lucide-react";
import type { AnalyticsFullRangePayload } from "@/lib/analytics/build-analytics-range-payload";
import { AnalyticsChartCard } from "@/components/analytics/analytics-chart-card";
import { AnalyticsRatingsChart, AnalyticsSentimentChart } from "@/components/analytics/analytics-charts-registry";

export function AnalyticsPageRatingSentimentRow({ d }: { d: AnalyticsFullRangePayload; isDemo: boolean }) {
    return <div className="grid gap-5 xl:grid-cols-3">
        <AnalyticsChartCard title="Rating trend" description="How your customer ratings change over time" icon={ChartNoAxesCombined} className="xl:col-span-2">
            <AnalyticsRatingsChart data={d.trendData} overallAvg={d.stats.avgRating} />
        </AnalyticsChartCard>
        <AnalyticsChartCard title="Rating distribution" description="Share of reviews by star rating" icon={ChartPie}>
            <AnalyticsSentimentChart data={d.sentimentData} />
        </AnalyticsChartCard>
    </div>;
}
