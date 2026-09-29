"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { DailyMetricPoint } from "@/services/google/performance-queries";
import { ChartEmpty, ChartKey, chartAxis, chartDate, chartTooltipStyle } from "@/components/analytics/chart-presentation";
import { cn } from "@/lib/utils";

const actions = [
    { key: "websiteClicks", label: "Website clicks", color: "var(--chart-5)", dash: undefined },
    { key: "calls", label: "Calls", color: "var(--chart-2)", dash: "6 3" },
    { key: "directions", label: "Directions", color: "var(--primary)", dash: "2 3" },
];
export function GooglePerformanceProfileChart({ data }: { data: DailyMetricPoint[] }) {
    const [view, setView] = useState<"views" | "actions">("views");
    if (!data.length) return <ChartEmpty message="No Google listing metrics yet" />;
    const series = view === "views" ? [{ key: "profileViews", label: "Profile views", color: "var(--primary)", dash: undefined }] : actions;
    const points = [...data].sort((a, b) => a.date.localeCompare(b.date));
    return <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div role="group" aria-label="Google performance metric" className="inline-flex rounded-lg border border-border bg-muted p-1">
                {(["views", "actions"] as const).map(v => <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={cn("rounded-md px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring", view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                    {v === "views" ? "Profile views" : "Customer actions"}
                </button>)}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">{series.map(s => <ChartKey key={s.key} label={s.label} color={s.color} />)}</div>
        </div>
        <div className="h-[280px] w-full" role="group" aria-label={`Google ${view === "views" ? "profile views" : "customer actions"} over time`}>
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
                <LineChart data={points} margin={{ top: 12, right: 12, left: -12, bottom: 4 }} accessibilityLayer>
                    <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" />
                    <XAxis dataKey="date" tick={chartAxis} tickLine={false} axisLine={false} tickFormatter={v => chartDate(v)} minTickGap={40} tickMargin={12} />
                    <YAxis allowDecimals={false} tick={chartAxis} tickLine={false} axisLine={false} tickFormatter={v => Intl.NumberFormat("en", { notation: "compact" }).format(v)} />
                    <Tooltip contentStyle={chartTooltipStyle} labelFormatter={v => chartDate(String(v), true)} formatter={(v, name) => [Number(v).toLocaleString(), name]} />
                    {series.map(s => <Line key={s.key} type="linear" dataKey={s.key} name={s.label} stroke={s.color} strokeDasharray={s.dash} strokeWidth={2.5} dot={points.length === 1} activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }} isAnimationActive={false} />)}
                </LineChart>
            </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground">{view === "views" ? "Times your business appeared on Google Search and Maps." : "Clicks and direction requests, shown separately from views for a clearer comparison."}</p>
    </div>;
}
