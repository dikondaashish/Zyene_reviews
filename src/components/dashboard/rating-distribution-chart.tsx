"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface RatingData {
    rating: number;
    count: number;
}

const RATING_COLORS: Record<number, string> = {
    1: "#ef4444", // red
    2: "#f97316", // orange
    3: "#eab308", // yellow
    4: "#84cc16", // lime
    5: "#22c55e", // green
};

export function RatingDistributionChart({ data }: { data: RatingData[] }) {
    // Ensure all 5 ratings are represented
    const fullData = [1, 2, 3, 4, 5].map((rating) => {
        const found = data.find((d) => d.rating === rating);
        return {
            label: `${rating}★`,
            rating,
            count: found?.count || 0,
        };
    });

    const hasData = fullData.some((d) => d.count > 0);

    if (!hasData) {
        return (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                No ratings data yet
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart
                data={fullData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    horizontal={false}
                />
                <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                />
                <YAxis
                    dataKey="label"
                    type="category"
                    tick={{ fontSize: 13, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "13px",
                    }}
                    formatter={(value: number | undefined) => [value ?? 0, "Reviews"]}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                    {fullData.map((entry) => (
                        <Cell
                            key={`cell-${entry.rating}`}
                            fill={RATING_COLORS[entry.rating]}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
