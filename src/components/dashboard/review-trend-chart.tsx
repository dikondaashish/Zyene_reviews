"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface TrendDataPoint {
    day: string;
    count: number;
}

export function ReviewTrendChart({ data }: { data: TrendDataPoint[] }) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                No review data in the last 30 days
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                    <linearGradient id="reviewGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: string) => {
                        const d = new Date(value);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                    interval="preserveStartEnd"
                />
                <YAxis
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "13px",
                    }}
                    labelFormatter={(value: any) => {
                        const d = new Date(String(value));
                        return d.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        });
                    }}
                    formatter={(value: number | undefined) => [value ?? 0, "Reviews"]}
                />
                <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(221, 83%, 53%)"
                    strokeWidth={2}
                    fill="url(#reviewGradient)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
