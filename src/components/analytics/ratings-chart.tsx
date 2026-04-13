
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
    ReferenceLine
} from "recharts";

interface RatingDataPoint {
    date: string;
    rating: number;
    count: number;
}

export function RatingsChart({ data, overallAvg }: { data: RatingDataPoint[]; overallAvg: number }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (data.length === 0) {
        return (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground border border-dashed rounded-xl bg-muted/5">
                No rating data for this period
            </div>
        );
    }
    if (!mounted) {
        return <div className="h-[300px] w-full" />;
    }

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fontWeight: 500, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => {
                            const d = new Date(value);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                        minTickGap={40}
                        dy={10}
                    />
                    <YAxis
                        domain={[0, 5]}
                        tick={{ fontSize: 11, fontWeight: 500, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                        tickCount={6}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px",
                            padding: "8px 12px",
                        }}
                        labelClassName="font-bold text-xs mb-1"
                        labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                        formatter={(value: any) => [
                            <span key="val" className="text-primary">{Number(value).toFixed(1)} ★</span>,
                            "Avg Rating"
                        ]}
                    />
                    <ReferenceLine 
                        y={overallAvg} 
                        stroke="var(--primary)" 
                        strokeDasharray="4 4" 
                        strokeWidth={1.5}
                        label={{ 
                            value: `Avg: ${overallAvg.toFixed(1)}`, 
                            position: 'insideTopRight', 
                            fill: "var(--primary)", 
                            fontSize: 10,
                            fontWeight: 700,
                            offset: 10
                        }} 
                    />
                    <Area
                        type="monotone"
                        dataKey="rating"
                        stroke="var(--primary)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRating)"
                        animationDuration={1500}
                        activeDot={{ r: 5, strokeWidth: 2, stroke: "white" }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
