"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { ChartEmpty, ChartKey, chartAxis, chartDate, chartTooltipStyle } from "@/components/analytics/chart-presentation";

interface RatingDataPoint { date: string; rating: number; count: number }

export function RatingsChart({ data, overallAvg }: { data: RatingDataPoint[]; overallAvg: number }) {
    if (!data.length) return <ChartEmpty message="No ratings in this period" />;
    const points = data.map(d => ({ ...d, time: Date.parse(`${d.date}T00:00:00Z`) }));
    return <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <ChartKey label="Daily average" color="var(--primary)" />
            <span className="text-xs text-muted-foreground">Period average <strong className="ml-1 font-semibold text-foreground">{overallAvg.toFixed(1)} / 5</strong></span>
        </div>
        <div className="h-[260px] w-full" role="group" aria-label={`Daily review ratings on a zero to five scale. Period average ${overallAvg.toFixed(1)}.`}>
            <ResponsiveContainer width="100%" height={260} minWidth={0}>
                <LineChart data={points} margin={{ top: 12, right: 16, left: -24, bottom: 4 }} accessibilityLayer>
                    <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" />
                    <XAxis dataKey="time" type="number" scale="time" domain={["dataMin", "dataMax"]} tick={chartAxis} tickLine={false} axisLine={false} tickFormatter={v => chartDate(v)} minTickGap={40} tickMargin={12} />
                    <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={chartAxis} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} labelFormatter={v => chartDate(Number(v), true)} formatter={v => [`${Number(v).toFixed(1)} / 5`, "Average rating"]} cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 4" }} />
                    <ReferenceLine y={overallAvg} stroke="var(--muted-foreground)" strokeDasharray="5 5" />
                    <Line type="linear" dataKey="rating" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 2, fill: "var(--card)" }} activeDot={{ r: 5, stroke: "var(--card)", strokeWidth: 2 }} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground">Each point represents a day with reviews. Dashed line shows the period average.</p>
    </div>;
}
