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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { CompetitorChartDataEntry } from "./competitors-types";
import { CompetitorsChartLegend } from "./competitors-chart-legend";

export function CompetitorsChartReviewsCard({
    chartData,
}: {
    chartData: CompetitorChartDataEntry[];
}) {
    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader>
                <CardTitle>Review Volume Comparison</CardTitle>
                <CardDescription>
                    Your total Google reviews vs competitors (public totals from sync).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <CompetitorsChartLegend />
                <div className="min-w-0 overflow-x-auto -mx-1 px-1 sm:mx-0 sm:overflow-visible sm:px-0">
                    <div className="h-[220px] w-full min-w-[260px] sm:min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 12, right: 8, left: -8, bottom: 36 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                    tick={{ fontSize: 10 }}
                                    height={48}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    width={36}
                                    tick={{ fontSize: 10 }}
                                />
                                <Tooltip
                                    cursor={{ fill: "transparent" }}
                                    content={({ active, payload }) => {
                                        if (!active || !payload?.length) return null;
                                        const row = payload[0].payload as {
                                            fullName?: string;
                                            name: string;
                                            reviews: number;
                                            isOwn?: boolean;
                                        };
                                        const label = row.fullName || row.name;
                                        return (
                                            <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md">
                                                <p className="font-semibold">
                                                    {label}
                                                    {row.isOwn ? (
                                                        <span className="font-normal text-muted-foreground">
                                                            {" "}
                                                            (your business)
                                                        </span>
                                                    ) : null}
                                                </p>
                                                <p className="text-muted-foreground text-xs mt-0.5">
                                                    Total reviews:{" "}
                                                    {Number(row.reviews).toLocaleString()}
                                                </p>
                                            </div>
                                        );
                                    }}
                                />
                                <Bar
                                    dataKey="reviews"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={52}
                                    background={{ fill: "var(--border)", radius: 4 }}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`reviews-${index}`}
                                            fill={
                                                entry.isOwn
                                                    ? "var(--primary)"
                                                    : "var(--muted-foreground)"
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
