"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from "recharts";
import { ProChartContainer, chartConfig } from "@/components/ui/pro-chart-container";

interface RatingData {
    rating: number;
    count: number;
}

const RATING_COLORS: Record<number, string> = {
    1: "oklch(0.6 0.2 25)", // destructive/red
    2: "oklch(0.7 0.15 45)", // orange
    3: "oklch(0.8 0.15 85)", // yellow
    4: "oklch(0.75 0.16 125)", // lime
    5: "oklch(0.7 0.15 160)", // green
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
            <div className="flex h-62.5 items-center justify-center text-muted-foreground text-sm">
                No ratings data yet
            </div>
        );
    }

    return (
        <ProChartContainer 
            height={250} 
            title="Rating Distribution" 
            description="Lifetime rating breakdown"
            className="border-none bg-transparent p-0 backdrop-blur-none"
        >
            <BarChart
                data={fullData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
            >
                <CartesianGrid
                    {...chartConfig.grid}
                    horizontal={false}
                />
                <XAxis
                    type="number"
                    {...chartConfig.xAxis}
                    allowDecimals={false}
                />
                <YAxis
                    dataKey="label"
                    type="category"
                    {...chartConfig.yAxis}
                    width={40}
                />
                <Tooltip
                    contentStyle={chartConfig.tooltip.contentStyle}
                    formatter={(value) => {
                        const normalized = Array.isArray(value)
                            ? Number(value[0])
                            : Number(value);
                        return [Number.isFinite(normalized) ? normalized : 0, "Reviews"];
                    }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24} animationDuration={1500}>
                    {fullData.map((entry) => (
                        <Cell
                            key={`cell-${entry.rating}`}
                            fill={RATING_COLORS[entry.rating]}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ProChartContainer>
    );
}
