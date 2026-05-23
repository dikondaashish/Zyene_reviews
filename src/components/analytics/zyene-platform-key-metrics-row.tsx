"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowDownRight, MousePointer2, Star, TrendingUp } from "lucide-react";

import { getDelta, pct } from "@/components/analytics/zyene-platform-analytics-math";

export function ZyenePlatformKeyMetricsRow({
    allSourceClicked,
    prevAllSourceClicked,
    allSourceClickRate,
    totalSent,
    allSourcePostedToGoogle,
    allSourceConversionRate,
    prevAllSourcePostedToGoogle,
    allSourceAvgRating,
    prevAllSourceAvgRating,
    allSourceRatingsGivenLength,
    allSourceLowRatingsLength,
    prevAllSourceLowRatingsLength,
}: {
    allSourceClicked: number;
    prevAllSourceClicked: number;
    allSourceClickRate: number;
    totalSent: number;
    allSourcePostedToGoogle: number;
    allSourceConversionRate: number;
    prevAllSourcePostedToGoogle: number;
    allSourceAvgRating: number;
    prevAllSourceAvgRating: number;
    allSourceRatingsGivenLength: number;
    allSourceLowRatingsLength: number;
    prevAllSourceLowRatingsLength: number;
}) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
                {
                    title: "Link Opens",
                    value: allSourceClicked,
                    desc: `${allSourceClickRate}% of sent requests`,
                    delta: getDelta(allSourceClicked, prevAllSourceClicked),
                    icon: MousePointer2,
                },
                {
                    title: "Conversion Rate",
                    value: `${allSourceConversionRate}%`,
                    desc: `${allSourcePostedToGoogle} posted to Google of ${allSourceClicked} clicks`,
                    delta: getDelta(
                        pct(allSourcePostedToGoogle, allSourceClicked),
                        pct(prevAllSourcePostedToGoogle, prevAllSourceClicked)
                    ),
                    icon: TrendingUp,
                },
                {
                    title: "Avg Rating Given",
                    value: allSourceAvgRating > 0 ? allSourceAvgRating.toFixed(1) : "—",
                    desc: `From ${allSourceRatingsGivenLength} ratings`,
                    delta: getDelta(allSourceAvgRating, prevAllSourceAvgRating),
                    icon: Star,
                },
                {
                    title: "Low Ratings (≤3★)",
                    value: allSourceLowRatingsLength,
                    desc: "Intercepted before Google",
                    delta: getDelta(allSourceLowRatingsLength, prevAllSourceLowRatingsLength),
                    icon: AlertTriangle,
                    invertTrend: true,
                },
            ].map((metric, idx) => {
                const isPositive = metric.delta > 0;
                const isNeg = metric.delta < 0;
                let trendColor = "text-muted-foreground bg-muted/20";
                if (isPositive)
                    trendColor = metric.invertTrend
                        ? "text-sync-action bg-sync-action/10 dark:bg-sync-action/20"
                        : "text-chart-2 bg-chart-2/10 dark:bg-chart-2/20";
                if (isNeg)
                    trendColor = metric.invertTrend
                        ? "text-chart-2 bg-chart-2/10 dark:bg-chart-2/20"
                        : "text-sync-action bg-sync-action/10 dark:bg-sync-action/20";

                return (
                    <motion.div
                        key={metric.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -4, scale: 1.01 }}
                    >
                        <Card className="relative h-full overflow-hidden border-2 border-transparent bg-background/60 p-1 backdrop-blur-xl transition-all hover:border-primary/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground truncate">
                                    {metric.title}
                                </CardTitle>
                                <metric.icon className="text-primary size-4" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-3xl font-black tracking-tight leading-none">
                                    {metric.value}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <div
                                        className={cn(
                                            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
                                            trendColor
                                        )}
                                    >
                                        {isPositive && <TrendingUp className="size-3" />}
                                        {isNeg && <ArrowDownRight className="size-3" />}
                                        {Math.abs(metric.delta).toFixed(1)}%
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium line-clamp-1">
                                        {metric.desc}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
}
