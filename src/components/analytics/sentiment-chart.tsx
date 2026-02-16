
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SentimentDataPoint {
    name: string;
    value: number;
    color: string;
}

const COLORS = {
    Positive: "#22c55e",
    Neutral: "#94a3b8",
    Negative: "#ef4444",
    Mixed: "#eab308"
};

export function SentimentChart({ data }: { data: SentimentDataPoint[] }) {
    if (data.every(d => d.value === 0)) {
        return (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No sentiment data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                    }}
                    formatter={(value: any) => [`${value} reviews`, 'Count']}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
