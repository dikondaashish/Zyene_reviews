
"use client";

import {
    LineChart,
    Line,
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
    if (data.length === 0) {
        return (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No rating data for this period
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                        const d = new Date(value);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                    minTickGap={30}
                />
                <YAxis
                    domain={[0, 5]}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    tickCount={6}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    formatter={(value: any) => [
                        typeof value === 'number' ? value.toFixed(1) : value,
                        "Avg Rating"
                    ]}
                />
                <ReferenceLine y={overallAvg} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ value: `Avg: ${overallAvg.toFixed(1)}`, position: 'insideTopRight', fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
