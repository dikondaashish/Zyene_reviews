"use client";

import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Sparkles } from "lucide-react";
import type { AnalyticsFullRangePayload } from "@/lib/analytics/build-analytics-range-payload";
import { AnalyticsVolumeChart, AnalyticsThemeChart } from "@/components/analytics/analytics-charts-registry";

export function AnalyticsPageVolumeThemesRow({ d }: { d: AnalyticsFullRangePayload }) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <Card className="lg:col-span-3 bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
                <CardHeader>
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Globe className="text-primary size-5" />
                            Review Volume
                        </CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">
                            Total review count across distribution channels
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="pl-0 pb-6">
                    <Suspense fallback={<div className="h-[260px] rounded-lg bg-muted/40 animate-pulse" />}>
                        <AnalyticsVolumeChart data={d.trendData} />
                    </Suspense>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
                <CardHeader>
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Sparkles className="text-primary size-5" />
                            Common Themes
                        </CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">
                            Key topics frequently mentioned in reviews
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="pb-6">
                    <Suspense fallback={<div className="h-[220px] rounded-lg bg-muted/40 animate-pulse" />}>
                        <AnalyticsThemeChart data={d.themeData} />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
