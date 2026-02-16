
"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

interface VolumeDataPoint {
    date: string;
    positive: number;
    neutral: number;
    negative: number;
}

export function VolumeChart({ data }: { data: VolumeDataPoint[] }) {
    if (data.length === 0) {
        return (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No volume data for this period
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
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
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                />
                <Legend />
                <Bar dataKey="positive" name="Positive (4-5★)" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
                <Bar dataKey="neutral" name="Neutral (3★)" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />
                <Bar dataKey="negative" name="Negative (1-2★)" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
