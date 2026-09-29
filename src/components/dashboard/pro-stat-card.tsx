"use client";

import { MessageSquare, TrendingDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { PRO_STAT_CARD_ICON_MAP } from "@/components/dashboard/pro-stat-card-icon-map";
import { ProStatCardRatingStarSlot, ProStatCardTrendUpGlyph } from "@/components/dashboard/pro-stat-card-rating-star";
import type { ProStatCardProps } from "@/components/dashboard/pro-stat-card-types";

export function ProStatCard({
    title,
    value,
    iconName,
    description,
    trend,
    trendFormat = "percent",
    trendLabel,
    prefix = "",
    suffix = "",
    precision = 0,
    className,
}: ProStatCardProps) {
    const Icon = PRO_STAT_CARD_ICON_MAP[iconName] || MessageSquare;
    const hasTrend = typeof trend === "number";
    const isStarDelta = trendFormat === "star_delta";
    const isPositive = hasTrend && (trend as number) > 0;
    const isNegative = hasTrend && (trend as number) < 0;
    const showRatingStars = iconName === "rating" && Number.isFinite(value) && value > 0;
    const ratingClamped = showRatingStars ? Math.max(0, Math.min(5, value)) : 0;

    return (
        <div
            className={cn(
                "relative min-w-0 rounded-2xl border border-border bg-card p-5 md:p-6 min-h-[180px]",
                className,
            )}
        >

            <div className="relative flex items-center justify-between">
                <div className="flex items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary size-10">
                    <Icon className="size-5" />
                </div>
                {hasTrend && (
                    <div
                        className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                            isPositive
                                ? "bg-chart-2/10 text-success"
                                : isNegative
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-muted text-muted-foreground",
                        )}
                    >
                        <span className="flex items-center">
                            {isStarDelta ? (
                                <>
                                    {(trend as number) > 0 ? "+" : ""}
                                    {(trend as number).toFixed(1)}
                                    <span className="ml-0.5 opacity-90">pts</span>
                                </>
                            ) : (
                                <>
                                    {isPositive ? "+" : ""}
                                    {trend}%
                                </>
                            )}
                            {isPositive ? (
                                <ProStatCardTrendUpGlyph />
                            ) : isNegative ? (
                                <TrendingDown className="ml-1 size-4" />
                            ) : null}
                        </span>
                    </div>
                )}
            </div>

            <div className="relative mt-4 space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className="flex flex-wrap items-baseline gap-1">
                    <span className="text-4xl font-semibold tabular-nums tracking-tight text-foreground">
                        {prefix}{value.toLocaleString("en-US", { minimumFractionDigits: precision, maximumFractionDigits: precision })}{suffix}
                    </span>
                    {showRatingStars && (
                        <div
                            className="ml-2 flex items-center gap-1 pb-1"
                            aria-label={`${ratingClamped.toFixed(1)} out of 5 stars`}
                        >
                            {[1, 2, 3, 4, 5].map((i) => {
                                const fill = Math.min(1, Math.max(0, ratingClamped - (i - 1)));
                                return <ProStatCardRatingStarSlot key={i} fill={fill} />;
                            })}
                        </div>
                    )}
                </div>
                {description && (
                    <p className="text-xs leading-relaxed text-muted-foreground min-h-8">
                        {description}
                        {trendLabel && <span className="ml-1 opacity-80">{trendLabel}</span>}
                    </p>
                )}
            </div>

        </div>
    );
}
