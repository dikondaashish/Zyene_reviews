
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
        Positive: "var(--chart-2)",
        Neutral: "var(--chart-3)",
        Negative: "var(--destructive)",
        Mixed: "var(--chart-5)",
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
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "12px",
                            boxShadow: "var(--pro-shadow)",
                            padding: "8px 12px",
                        }}
                        itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                        formatter={(value) => {
                            const count = typeof value === "number" ? value : Number(value) || 0;
                            return [`${count} reviews`, "Count"];
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{
                            paddingTop: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 12,
                            justifyContent: "center",
                            rowGap: 8,
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
