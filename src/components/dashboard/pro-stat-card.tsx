"use client";

import { motion } from "framer-motion";
import { MessageSquare, TrendingDown } from "lucide-react";

import { AnimatedNumber } from "@/components/ui/animated-number";
import { cn } from "@/lib/utils";
import { PRO_STAT_CARD_ICON_MAP } from "./pro-stat-card-icon-map";
import { ProStatCardRatingStarSlot, ProStatCardTrendUpGlyph } from "./pro-stat-card-rating-star";
import type { ProStatCardProps } from "./pro-stat-card-types";

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
    delay = 0,
}: ProStatCardProps) {
    const Icon = PRO_STAT_CARD_ICON_MAP[iconName] || MessageSquare;
    const hasTrend = typeof trend === "number";
    const isStarDelta = trendFormat === "star_delta";
    const isPositive = hasTrend && (trend as number) > 0;
    const isNegative = hasTrend && (trend as number) < 0;
    const showRatingStars = iconName === "rating" && Number.isFinite(value) && value > 0;
    const ratingClamped = showRatingStars ? Math.max(0, Math.min(5, value)) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
            className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 md:p-6 min-h-[180px]",
                "transition-all duration-200 hover:border-primary/30 hover:shadow-sm",
                className,
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition-transform group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                </div>
                {hasTrend && (
                    <div
                        className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                            isPositive
                                ? "bg-chart-2/10 text-chart-2"
                                : isNegative
                                  ? "bg-destructive/100/10 text-destructive"
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
                                <TrendingDown className="ml-1 h-4 w-4" />
                            ) : null}
                        </span>
                    </div>
                )}
            </div>

            <div className="relative mt-4 space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className="flex items-baseline gap-1">
                    <AnimatedNumber
                        value={value}
                        prefix={prefix}
                        suffix={suffix}
                        precision={precision}
                        className="text-4xl font-bold tracking-tight text-foreground"
                    />
                    {showRatingStars && (
                        <div
                            className="ml-2 flex items-center gap-0.5 pb-1"
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
                    <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2 min-h-8">
                        {description}
                        {trendLabel && <span className="ml-1 opacity-80">{trendLabel}</span>}
                    </p>
                )}
            </div>

            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </motion.div>
    );
}
