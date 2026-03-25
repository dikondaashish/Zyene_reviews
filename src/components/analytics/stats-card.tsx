"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    description: string;
    trend?: {
        value: number;
        label: string;
        invertColor?: boolean; // If true, negative is green (e.g. for churn)
    };
    isDemo?: boolean;
}

export function StatsCard({ title, value, description, trend, isDemo }: StatsCardProps) {
    const isPositive = trend && trend.value > 0;
    const isNegative = trend && trend.value < 0;
    const isNeutral = trend && trend.value === 0;

    let trendColor = "text-muted-foreground";
    if (trend) {
        if (isPositive) trendColor = trend.invertColor ? "text-red-600" : "text-green-600";
        if (isNegative) trendColor = trend.invertColor ? "text-green-600" : "text-red-600";
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between w-full">
                    {title}
                    {isDemo && (
                        <Badge variant="secondary" className="h-5 text-[9px] uppercase tracking-wider bg-orange-100 text-orange-700 border-none ml-2">
                            Demo Data
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center gap-2 mt-1">
                    {trend && (
                        <div className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
                            {isPositive && <TrendingUp className="h-3 w-3" />}
                            {isNegative && <TrendingDown className="h-3 w-3" />}
                            {isNeutral && <Minus className="h-3 w-3" />}
                            {Math.abs(trend.value).toFixed(1)}%
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}
