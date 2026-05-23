"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { CompetitorWatchBenchmarkRange } from "./competitors-types";

export function CompetitorsTableBenchmarkCard({
    activeBenchmarkRange,
    activeOwnBusinessInRange,
    competitorsCount,
}: {
    activeBenchmarkRange: CompetitorWatchBenchmarkRange;
    activeOwnBusinessInRange: {
        avgRating: number | null;
        reviewCount: number;
    };
    competitorsCount: number;
}) {
    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle>Market Benchmark ({activeBenchmarkRange.label})</CardTitle>
                <CardDescription>
                    Your average rating uses reviews received in this period. Competitors use the latest
                    snapshot in this period (or current totals if no snapshot yet).{" "}
                    {!activeBenchmarkRange.marketBenchmarkAvailable && competitorsCount > 0 ? (
                        <span className="text-chart-4 dark:text-chart-4">
                            Competitor ratings are not loaded yet ,  run Sync from Google or wait for the
                            next sync.
                        </span>
                    ) : activeBenchmarkRange.marketEndUsedFallback ? (
                        "Some competitors fell back to live totals where snapshots were missing."
                    ) : null}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 lg:grid-cols-4">
                    <div className="min-w-0 rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Your rank (by period rating)</p>
                        <p className="text-xl font-semibold">
                            {activeBenchmarkRange.rank ? `#${activeBenchmarkRange.rank}` : "-"}
                            <span className="text-sm text-muted-foreground">
                                {" "}
                                / {activeBenchmarkRange.totalRanked || "-"}
                            </span>
                        </p>
                    </div>
                    <div className="min-w-0 rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">
                            Your avg rating ({activeBenchmarkRange.label})
                        </p>
                        <p className="text-xl font-semibold">
                            {activeOwnBusinessInRange.avgRating !== null
                                ? activeOwnBusinessInRange.avgRating.toFixed(1)
                                : "-"}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            {activeOwnBusinessInRange.reviewCount} reviews in period
                        </p>
                    </div>
                    <div className="min-w-0 rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">You vs market end (rating)</p>
                        <p className="text-xl font-semibold">
                            {activeBenchmarkRange.yourAvgVsMarketEnd === null
                                ? ", "
                                : `${activeBenchmarkRange.yourAvgVsMarketEnd > 0 ? "+" : ""}${activeBenchmarkRange.yourAvgVsMarketEnd.toFixed(1)}`}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            {activeBenchmarkRange.marketBenchmarkAvailable ? (
                                <>Market end avg {activeBenchmarkRange.marketEndAvgRating.toFixed(1)}</>
                            ) : (
                                <>Market average unavailable until competitor data syncs</>
                            )}
                        </p>
                    </div>
                    <div className="min-w-0 rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Avg competitor review gain</p>
                        <p className="text-xl font-semibold">
                            {activeBenchmarkRange.marketAvgReviewGain === null
                                ? ", "
                                : `${activeBenchmarkRange.marketAvgReviewGain > 0 ? "+" : ""}${Math.round(activeBenchmarkRange.marketAvgReviewGain)}`}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            Mean first→last snapshot in {activeBenchmarkRange.label}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
