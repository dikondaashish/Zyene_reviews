
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SentimentDataPoint {
    name: string;
    value: number;
    color: string;
}

export function SentimentChart({ data }: { data: SentimentDataPoint[] }) {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    if (total === 0) {
        return (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground border border-dashed rounded-xl bg-muted/5">
                No sentiment data available
            </div>
        );
    }

    // Refined colors
    const colorMap: Record<string, string> = {
        Positive: "#10b981",
        Neutral: "#94a3b8",
        Negative: "#f43f5e",
        Mixed: "#f59e0b"
    };

    const displayData = data.map(d => ({
        ...d,
        color: colorMap[d.name] || d.color
    }));

    return (
        <div className="w-full h-[300px] relative">
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-3xl font-black tracking-tight">{total}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reviews</span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={displayData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={8}
                        cornerRadius={40}
                        dataKey="value"
                        stroke="none"
                        animationBegin={0}
                        animationDuration={1500}
                    >
                        {displayData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            padding: "8px 12px",
                        }}
                        itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                        formatter={(value: number | string) => [`${value} reviews`, 'Count']}
                    />
                    <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 600 }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
