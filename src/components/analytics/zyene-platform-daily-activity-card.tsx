"use client";

import { ChartNoAxesCombined } from "lucide-react";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AnalyticsChartCard } from "@/components/analytics/analytics-chart-card";
import { ChartEmpty, ChartKey, chartAxis, chartDate, chartTooltipStyle } from "@/components/analytics/chart-presentation";

export type ZyeneDailyDatum = { date: string; sent: number; clicked: number; completed: number };
const series = [
    { key: "sent", label: "Sent", color: "var(--primary)", dash: undefined },
    { key: "clicked", label: "Clicked", color: "var(--chart-5)", dash: "6 3" },
    { key: "completed", label: "Completed", color: "var(--chart-2)", dash: "2 3" },
];
export function ZyenePlatformDailyActivityCard({ dailyData }: { dailyData: ZyeneDailyDatum[] }) {
    return <AnalyticsChartCard title="Daily activity" description="Requests sent, link clicks and completed reviews" icon={ChartNoAxesCombined} className="lg:col-span-3">
        {!dailyData.length ? <ChartEmpty message="No request activity in this period" /> : <div className="space-y-5">
            <div className="flex flex-wrap gap-5">{series.map(s => <ChartKey key={s.key} label={s.label} color={s.color} />)}</div>
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height={280} minWidth={0}>
                    <LineChart data={dailyData} margin={{ top: 12, right: 12, left: -24, bottom: 4 }} accessibilityLayer>
                        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" />
                        <XAxis dataKey="date" tick={chartAxis} tickLine={false} axisLine={false} tickFormatter={v => chartDate(v)} minTickGap={40} tickMargin={12} />
                        <YAxis allowDecimals={false} tick={chartAxis} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={chartTooltipStyle} labelFormatter={v => chartDate(String(v), true)} />
                        {series.map(s => <Line key={s.key} type="linear" dataKey={s.key} name={s.label} stroke={s.color} strokeDasharray={s.dash} strokeWidth={2.5} dot={dailyData.length === 1} activeDot={{ r: 4 }} isAnimationActive={false} />)}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>}
    </AnalyticsChartCard>;
}
