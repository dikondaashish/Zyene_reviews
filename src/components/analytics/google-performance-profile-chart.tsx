"use client";

import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import type { DailyMetricPoint } from "@/services/google/performance-queries";

export function GooglePerformanceProfileChart({ data }: { data: DailyMetricPoint[] }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (data.length === 0) {
        return (
            <div className="flex h-[280px] items-center justify-center text-muted-foreground border border-dashed rounded-xl bg-muted/5 text-sm">
                No Google listing metrics for this period yet. Sync Google or wait for the daily job.
            </div>
        );
    }

    if (!mounted) {
        return <div className="h-[280px] w-full" />;
    }

    // Sort data by date just in case
    const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

    const chartData = sortedData.map((d) => ({
        ...d,
        label: d.date.slice(5), // MM-DD
    }));

    return (
        <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis 
                        dataKey="label" 
                        tick={{ fontSize: 11, fontWeight: 500, fill: "var(--muted-foreground)" }} 
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                        dy={10}
                    />
                    <YAxis 
                        tick={{ fontSize: 11, fontWeight: 500, fill: "var(--muted-foreground)" }} 
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "12px",
                            padding: "8px 12px",
                        }}
                        labelClassName="font-bold text-xs mb-1"
                        labelFormatter={(label, payload) => {
                            const p = payload?.[0]?.payload as DailyMetricPoint & { label?: string };
                            if (!p?.date) return label;
                            return new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                        }}
                        itemStyle={{ fontSize: '11px', fontWeight: 600, padding: '2px 0' }}
                    />
                    <Legend 
                        verticalAlign="top" 
                        align="right" 
                        iconType="circle" 
                        iconSize={8}
                        wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: 500 }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="profileViews" 
                        name="Profile views" 
                        stroke="var(--primary)" 
                        strokeWidth={3} 
                        dot={false} 
                        activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
                        animationDuration={1500}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="websiteClicks" 
                        name="Website clicks" 
                        stroke="var(--primary)" 
                        strokeWidth={3} 
                        dot={false} 
                        activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
                        animationDuration={1500}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="calls" 
                        name="Calls" 
                        stroke="var(--chart-2)" 
                        strokeWidth={3} 
                        dot={false} 
                        activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
                        animationDuration={1500}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="directions" 
                        name="Directions" 
                        stroke="var(--chart-5)" 
                        strokeWidth={3} 
                        dot={false} 
                        activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
                        animationDuration={1500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
