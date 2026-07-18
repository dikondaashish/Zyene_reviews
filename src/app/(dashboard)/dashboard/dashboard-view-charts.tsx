import { Star, TrendingUp } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DashboardRatingDistributionChartLazy,
    DashboardReviewTrendChartLazy,
} from "@/components/dashboard/dashboard-ssr-false-blocks";
import type { DashboardViewProps } from "./types";

type Props = Pick<
    DashboardViewProps,
    | "trendData"
    | "ratingData"
    | "totalReviewsTrend"
    | "displayTotalReviews"
    | "displayAverageRating"
>;

export function DashboardViewCharts({
    trendData,
    ratingData,
    totalReviewsTrend,
    displayTotalReviews,
    displayAverageRating,
}: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="flex flex-col">
                <CardHeader className="flex flex-col gap-2 pb-0 sm:flex-row sm:items-start sm:justify-between lg:items-center">
                    <div className="min-w-0">
                        <CardTitle className="text-base font-bold text-foreground">
                            Review volume
                        </CardTitle>
                        <CardDescription className="mt-0.5 text-[13px] text-muted-foreground/80">
                            Last 30 days &middot; hover any day for detail
                        </CardDescription>
                    </div>
                    {totalReviewsTrend !== undefined && totalReviewsTrend !== 0 && (
                        <div
                            className={`flex shrink-0 items-center gap-1 self-start rounded-md px-2 py-1 text-xs font-semibold sm:self-auto ${totalReviewsTrend > 0 ? "bg-[rgb(229,238,221)] text-[rgb(62,95,46)]" : "bg-destructive/10 text-destructive"}`}
                        >
                            {totalReviewsTrend > 0 ? (
                                <TrendingUp className="size-3" />
                            ) : (
                                <TrendingUp className="rotate-180 size-3" />
                            )}
                            <span className="max-sm:sr-only">
                                {Math.abs(totalReviewsTrend)}% vs 30d prior
                            </span>
                            <span className="sm:hidden">{Math.abs(totalReviewsTrend)}%</span>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="min-w-0 flex-1 pt-6 pb-2 px-0 pl-1">
                    <DashboardReviewTrendChartLazy data={trendData} />
                </CardContent>
            </Card>

            <Card className="flex flex-col">
                <CardHeader className="flex flex-col gap-2 pb-0 sm:flex-row sm:items-start sm:justify-between lg:items-center">
                    <div className="min-w-0">
                        <CardTitle className="text-base font-bold text-foreground">
                            Star distribution
                        </CardTitle>
                        <CardDescription className="mt-0.5 text-[13px] text-muted-foreground/80">
                            All-time &middot; {displayTotalReviews} reviews
                        </CardDescription>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-xl font-medium tracking-tight">
                        {displayAverageRating.toFixed(1)}
                        <Star className="fill-chart-4 text-chart-4 size-4" strokeWidth={1} />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 pt-6 pb-6">
                    <DashboardRatingDistributionChartLazy data={ratingData} />
                </CardContent>
            </Card>
        </div>
    );
}
