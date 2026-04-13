"use client";

import { useState, useEffect } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { ProChartContainer, chartConfig } from "@/components/ui/pro-chart-container";

interface TrendDataPoint {
    day: string;
    count: number;
}

export function ReviewTrendChart({ data }: { data: TrendDataPoint[] }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (data.length === 0) {
        return (
            <div className="flex h-62.5 items-center justify-center text-muted-foreground text-sm">
                No review data in the last 30 days
            </div>
        );
    }

    if (!mounted) {
        return <div className="h-[250px] w-full" />;
    }

    return (
        <ProChartContainer 
            height={250} 
            title="Review Trends" 
            description="Automatic review volume tracking"
            className="border-none bg-transparent p-0 backdrop-blur-none"
        >
            <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid {...chartConfig.grid} />
                <XAxis
                    dataKey="day"
                    {...chartConfig.xAxis}
                    tickFormatter={(value: string) => {
                        const d = new Date(value);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                    interval="preserveStartEnd"
                />
                <YAxis
                    {...chartConfig.yAxis}
                    allowDecimals={false}
                />
                <Tooltip
                    contentStyle={chartConfig.tooltip.contentStyle}
                    labelFormatter={(value) => {
                        const normalized = typeof value === "string" || typeof value === "number"
                            ? String(value)
                            : "";
                        const d = new Date(normalized);
                        return d.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        });
                    }}
                    formatter={(value) => {
                        const normalized = Array.isArray(value)
                            ? Number(value[0])
                            : Number(value);
                        return [Number.isFinite(normalized) ? normalized : 0, "Reviews"];
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#proGradient)"
                    animationDuration={1500}
                />
            </AreaChart>
        </ProChartContainer>
    );
}
