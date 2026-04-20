"use client";

import { useState, useEffect } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

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
        <div className="h-[250px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="color-mix(in oklab, var(--border) 60%, transparent)" />
                    <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                        tickFormatter={(value: string) => {
                            const d = new Date(value);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                        interval="preserveStartEnd"
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                        allowDecimals={false}
                        dx={-10}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "var(--card)",
                            borderRadius: "12px",
                            border: "1px solid var(--border)",
                            boxShadow: "var(--shadow-sm)"
                        }}
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
                        fill="color-mix(in oklab, var(--chart-2) 15%, transparent)"
                        activeDot={{ r: 4, fill: "var(--primary)" }}
                        dot={{ r: 2.5, fill: "var(--primary)", strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
