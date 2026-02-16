
"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

interface ThemeDataPoint {
    theme: string;
    count: number;
    sentimentScore: number; // >0 positive, <0 negative
}

export function ThemeChart({ data }: { data: ThemeDataPoint[] }) {
    if (data.length === 0) {
        return (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No theme data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                layout="vertical"
                data={data}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                <XAxis type="number" hide />
                <YAxis
                    dataKey="theme"
                    type="category"
                    tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                    width={100}
                    tickFormatter={(value) => value.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                />
                <Tooltip
                    cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                    contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                    }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.sentimentScore >= 0 ? "#22c55e" : "#ef4444"} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
