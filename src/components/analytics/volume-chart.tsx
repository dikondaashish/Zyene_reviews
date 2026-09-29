"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartEmpty, ChartKey, chartAxis, chartDate, chartTooltipStyle } from "@/components/analytics/chart-presentation";

interface VolumeDataPoint { date: string; positive: number; neutral: number; negative: number }
const series = [
    { key: "positive", label: "Positive", color: "var(--chart-2)" },
    { key: "neutral", label: "Neutral", color: "var(--chart-3)" },
    { key: "negative", label: "Negative", color: "var(--destructive)" },
];
export function VolumeChart({ data }: { data: VolumeDataPoint[] }) {
    if (!data.length) return <ChartEmpty message="No reviews in this period" />;
    return <div className="space-y-5">
        <div className="flex flex-wrap gap-x-5 gap-y-2">{series.map(s => <ChartKey key={s.key} label={s.label} color={s.color} />)}</div>
        <div className="h-[260px] w-full" role="group" aria-label="Daily review counts, stacked by positive, neutral and negative star ratings">
            <ResponsiveContainer width="100%" height={260} minWidth={0}>
                <BarChart data={data} margin={{ top: 12, right: 8, left: -24, bottom: 4 }} maxBarSize={24} barCategoryGap="25%" accessibilityLayer>
                    <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" />
                    <XAxis dataKey="date" tick={chartAxis} tickLine={false} axisLine={false} tickFormatter={v => chartDate(v)} minTickGap={40} tickMargin={12} />
                    <YAxis allowDecimals={false} tick={chartAxis} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} labelFormatter={v => chartDate(String(v), true)} cursor={{ fill: "var(--muted)" }} />
                    {series.map(s => <Bar key={s.key} dataKey={s.key} name={s.label} stackId="reviews" fill={s.color} isAnimationActive={false} />)}
                </BarChart>
            </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground">Days with reviews · Positive: 4–5 stars · Neutral: 3 · Negative: 1–2</p>
    </div>;
}
