"use client";

import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge, Sparkles } from "lucide-react";
import type { AnalyticsFullRangePayload } from "@/lib/analytics/build-analytics-range-payload";
import { AnalyticsRatingsChart, AnalyticsSentimentChart } from "@/components/analytics/analytics-charts-registry";

export function AnalyticsPageRatingSentimentRow({ d, isDemo }: { d: AnalyticsFullRangePayload; isDemo: boolean }) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2 bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Gauge className="w-5 h-5 text-primary" />
                            Rating Trend
                        </CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">Average score fluctuations daily</p>
                    </div>
                    <Badge variant="secondary" className="font-bold bg-primary/10 text-primary border-primary/20">
                        Avg: {d.stats.avgRating.toFixed(1)}
                    </Badge>
                </CardHeader>
                <CardContent className="pl-0 pb-6">
                    <Suspense fallback={<div className="h-[280px] rounded-lg bg-muted/40 animate-pulse" />}>
                        <AnalyticsRatingsChart data={d.trendData} overallAvg={d.stats.avgRating} />
                    </Suspense>
                </CardContent>
            </Card>

            <Card className="bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
                <CardHeader>
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            Sentiment Breakdown
                        </CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">AI-analyzed review emotional tone</p>
                    </div>
                </CardHeader>
                <CardContent className="pb-6">
                    <Suspense fallback={<div className="h-[220px] rounded-lg bg-muted/40 animate-pulse" />}>
                        <AnalyticsSentimentChart data={d.sentimentData} />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
