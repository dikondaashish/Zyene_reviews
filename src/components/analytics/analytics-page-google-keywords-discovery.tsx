"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import type { AnalyticsFullRangePayload } from "@/lib/analytics/build-analytics-range-payload";

export function AnalyticsPageGoogleKeywordsDiscovery({
    d,
    searchKeywords,
}: {
    d: AnalyticsFullRangePayload;
    searchKeywords: NonNullable<AnalyticsFullRangePayload["searchKeywords"]>;
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-card/60 border-border/50 backdrop-blur-md overflow-hidden group hover:border-primary/30 transition-all duration-500">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Search className="text-primary size-5" />
                            Search Keywords
                        </CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">
                            Monthly impressions per keyword from local discovery
                        </p>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        Top {searchKeywords.length} Keywords
                    </Badge>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {searchKeywords.slice(0, 10).map((k, i) => (
                            <div key={i} className="flex items-center justify-between group/item">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-muted/40 flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover/item:bg-primary/20 group-hover/item:text-primary transition-colors size-6">
                                        {i + 1}
                                    </div>
                                    <span className="text-sm text-foreground/70 group-hover/item:text-foreground transition-colors">
                                        {k.keyword}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-1.5 w-32 bg-muted/40 rounded-full overflow-hidden hidden sm:block">
                                        <div
                                            className="h-full bg-primary/40 group-hover/item:bg-primary transition-all duration-1000"
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    (Number(k.impressions) /
                                                        Math.max(
                                                            1,
                                                            ...searchKeywords.map((sk) => Number(sk.impressions))
                                                        )) *
                                                        100
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm font-mono font-bold text-muted-foreground group-hover/item:text-primary transition-colors">
                                        {Number(k.impressions).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {searchKeywords.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2">
                                <Search className="opacity-20 size-10" />
                                <p className="text-sm">No keyword data available for this selection</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20 flex flex-col">
                <CardHeader>
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold">Discovery Type</CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">Business name vs categories</p>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center space-y-8 pb-10 px-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Discovery
                                </p>
                                <p className="text-xs text-muted-foreground">Found via category/service</p>
                            </div>
                            <p className="text-3xl font-black text-primary">{d.discoverySplit.discoveryPct}%</p>
                        </div>
                        <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${d.discoverySplit.discoveryPct}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Branded
                                </p>
                                <p className="text-xs text-muted-foreground">Found via business name</p>
                            </div>
                            <p className="text-2xl font-black text-muted-foreground">{d.discoverySplit.directPct}%</p>
                        </div>
                        <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-foreground/60 rounded-full"
                                style={{ width: `${d.discoverySplit.directPct}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
