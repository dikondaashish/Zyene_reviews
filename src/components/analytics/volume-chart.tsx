
"use client";

import { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell
} from "recharts";

interface VolumeDataPoint {
    date: string;
    positive: number;
    neutral: number;
    negative: number;
}

export function VolumeChart({ data }: { data: VolumeDataPoint[] }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (data.length === 0) {
        return (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground border border-dashed rounded-xl bg-muted/5">
                No volume data for this period
            </div>
        );
    }
    if (!mounted) {
        return <div className="h-[300px] w-full" />;
    }

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barSize={20}>
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
                        tick={{ fontSize: 11, fontWeight: 500, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            padding: "8px 12px",
                        }}
                        cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                        labelClassName="font-bold text-xs mb-1"
                        labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                    />
                    <Legend 
                        verticalAlign="top" 
                        align="right" 
                        iconType="circle" 
                        iconSize={8}
                        wrapperStyle={{
                            paddingBottom: 20,
                            fontSize: 11,
                            fontWeight: 500,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 10,
                            justifyContent: "flex-end",
                            rowGap: 6,
                        }}
                    />
                    <Bar 
                        dataKey="negative" 
                        name="Negative (1-2★)" 
                        stackId="a" 
                        fill="#f43f5e" 
                        radius={[0, 0, 0, 0]} 
                    />
                    <Bar 
                        dataKey="neutral" 
                        name="Neutral (3★)" 
                        stackId="a" 
                        fill="#94a3b8" 
                        radius={[0, 0, 0, 0]} 
                    />
                    <Bar 
                        dataKey="positive" 
                        name="Positive (4-5★)" 
                        stackId="a" 
                        fill="#10b981" 
                        radius={[4, 4, 0, 0]} 
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
