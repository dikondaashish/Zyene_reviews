"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Minus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
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
        if (isPositive) trendColor = trend.invertColor ? "text-sync-action bg-sync-action/10 dark:bg-sync-action/20" : "text-chart-2 bg-chart-2/10 dark:bg-chart-2/20";
        if (isNegative) trendColor = trend.invertColor ? "text-chart-2 bg-chart-2/10 dark:bg-chart-2/20" : "text-sync-action bg-sync-action/10 dark:bg-sync-action/20";
    }

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn("h-full", className)}
        >
            <Card className="relative h-full overflow-hidden border-2 border-transparent bg-background/60 p-1 backdrop-blur-xl transition-all hover:border-primary/20 dark:bg-card/40">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                
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
                        <div className="text-3xl font-black tracking-tight leading-none">{value}</div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                        {trend && (
                            <div className={cn(
                                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold transition-colors",
                                trendColor
                            )}>
                                {isPositive && <TrendingUp className="size-3" />}
                                {isNegative && <TrendingDown className="size-3" />}
                                {isNeutral && <Minus className="size-3" />}
                                {Math.abs(trend.value).toFixed(1)}%
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground font-medium line-clamp-1">{description}</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
