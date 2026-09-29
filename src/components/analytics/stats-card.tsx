"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Minus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    description: string;
    trend?: {
        value: number;
        label: string;
        invertColor?: boolean;
    };
    isDemo?: boolean;
    className?: string;
}

export function StatsCard({ title, value, description, trend, isDemo, className }: StatsCardProps) {
    const isPositive = trend && trend.value > 0;
    const isNegative = trend && trend.value < 0;
    const isNeutral = trend && trend.value === 0;

    let trendColor = "text-muted-foreground bg-muted/20";
    if (trend) {
        if (isPositive) trendColor = trend.invertColor ? "text-destructive bg-destructive/10 dark:bg-destructive/20" : "text-success bg-chart-2/10 dark:bg-chart-2/20";
        if (isNegative) trendColor = trend.invertColor ? "text-success bg-chart-2/10 dark:bg-chart-2/20" : "text-destructive bg-destructive/10 dark:bg-destructive/20";
    }

    return (
        <div className={cn("h-full min-w-0", className)}>
            <Card className="h-full rounded-2xl border-border bg-card shadow-none">
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground flex items-center justify-between w-full">
                        <span className="truncate">{title}</span>
                        {isDemo && (
                            <Badge variant="secondary" className="h-5 text-[9px] uppercase tracking-wider bg-primary/10 text-primary border-none ml-2 shrink-0 flex items-center gap-1 px-1.5 py-0 font-bold">
                                <Sparkles className="size-2.5" />
                                Demo
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-baseline gap-1">
                        <div className="text-3xl font-semibold tabular-nums tracking-tight leading-none">{value}</div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                        {trend && (
                            <div className={cn(
                                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold transition-colors",
                                trendColor
                            )} aria-label={`${trend.value > 0 ? "+" : ""}${trend.value.toFixed(1)}% ${trend.label}`}>
                                {isPositive && <TrendingUp className="size-3" />}
                                {isNegative && <TrendingDown className="size-3" />}
                                {isNeutral && <Minus className="size-3" />}
                                {Math.abs(trend.value).toFixed(1)}%
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">{description}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
