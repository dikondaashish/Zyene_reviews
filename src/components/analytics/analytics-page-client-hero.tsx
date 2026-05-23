"use client";

import { Gauge, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnalyticsReportGenerator } from "@/components/analytics/analytics-charts-registry";
import { ExportDataButton } from "@/components/analytics/export-data-button";
import { PlatformTabs } from "@/components/analytics/platform-tabs";
import { AnalyticsFilters } from "@/components/analytics/analytics-filters";
import type { AnalyticsFullRangePayload } from "@/lib/analytics/build-analytics-range-payload";
import type { AnalyticsRange } from "@/lib/analytics/date-range";
import type { RangeKey } from "@/lib/query/date-range-keys";

export function AnalyticsPageClientHero({
    businessId,
    businessName,
    businessSlug,
    d,
    isDemo,
    range,
    platform,
    setPlatform,
    setRange,
}: {
    businessId: string;
    businessName: string;
    businessSlug: string;
    d: AnalyticsFullRangePayload;
    isDemo: boolean;
    range: AnalyticsRange;
    platform: string;
    setPlatform: (id: string) => void;
    setRange: (r: AnalyticsRange) => void;
}) {
    return (
        <>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold tracking-tight sm:gap-3 sm:text-4xl">
                            <Gauge className="text-primary size-9" />
                            Analytics
                            {isDemo && (
                                <Badge
                                    variant="outline"
                                    className="border-primary/30 bg-primary/10 text-primary flex items-center gap-1.5 px-3 font-bold tracking-tight"
                                >
                                    <Sparkles className="size-3.5" />
                                    Demo
                                </Badge>
                            )}
                        </h1>
                        <p className="text-muted-foreground font-medium">
                            Real-time performance metrics for{" "}
                            <span className="font-bold">{businessName || "your business"}</span>
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-2 rounded-xl border border-border/50 bg-muted/40 p-1 backdrop-blur-md sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                        <AnalyticsReportGenerator businessName={businessName || undefined} dateRange={d.rangeLabel} />
                        <ExportDataButton businessId={businessId} range={range} platform={platform} />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-y border-border/30">
                    <PlatformTabs
                        platforms={d.connectedPlatforms}
                        activePlatform={platform}
                        businessSlug={businessSlug}
                        onPlatformChange={setPlatform}
                    />
                    <AnalyticsFilters
                        businessId={businessId}
                        range={range as RangeKey}
                        platform={platform}
                        onRangeChange={setRange}
                    />
                </div>
            </div>
        </>
    );
}
