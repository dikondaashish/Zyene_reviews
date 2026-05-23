"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Sparkles } from "lucide-react";

export type ZyeneDailyDatum = { date: string; sent: number; clicked: number; completed: number };

export function ZyenePlatformDailyActivityCard({ dailyData }: { dailyData: ZyeneDailyDatum[] }) {
    return (
        <Card className="lg:col-span-3 bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
            <CardHeader>
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Sparkles className="text-primary size-5" />
                        Daily Activity
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-medium">
                        Requests sent vs link clicks vs completions
                    </p>
                </div>
            </CardHeader>
            <CardContent className="pl-0 pb-6">
                {dailyData.length > 0 ? (
                    <div className="w-full h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={dailyData}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="gradSent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradClicked" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="var(--border)"
                                    opacity={0.5}
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fontWeight: 500, fill: "var(--muted-foreground)" }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => {
                                        const d = new Date(v);
                                        return `${d.getMonth() + 1}/${d.getDate()}`;
                                    }}
                                    minTickGap={40}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fontWeight: 500, fill: "var(--muted-foreground)" }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--card)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "12px",
                                        padding: "8px 12px",
                                    }}
                                    labelClassName="font-bold text-xs mb-1"
                                    labelFormatter={(label) =>
                                        new Date(label).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                    }
                                    itemStyle={{ fontSize: "11px", fontWeight: 600 }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ paddingBottom: "20px", fontSize: "11px", fontWeight: 500 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sent"
                                    name="Sent"
                                    stroke="var(--primary)"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#gradSent)"
                                    animationDuration={1500}
                                    activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="clicked"
                                    name="Clicked"
                                    stroke="var(--primary)"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#gradClicked)"
                                    animationDuration={1500}
                                    activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="completed"
                                    name="Completed"
                                    stroke="var(--chart-2)"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#gradCompleted)"
                                    animationDuration={1500}
                                    activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex h-[280px] items-center justify-center text-muted-foreground border border-dashed rounded-xl bg-muted/5">
                        No daily data for this period
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
