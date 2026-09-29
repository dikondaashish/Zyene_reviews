"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartEmpty, chartTooltipStyle } from "@/components/analytics/chart-presentation";

interface SentimentDataPoint { name: string; value: number; color: string }
export function SentimentChart({ data }: { data: SentimentDataPoint[] }) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (!total) return <ChartEmpty message="No rating distribution yet" />;
    return <div className="space-y-4">
        <div className="relative h-[190px]" role="img" aria-label={`${total} reviews by rating category`}>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold tracking-tight tabular-nums">{total.toLocaleString()}</span>
                <span className="mt-1 text-xs text-muted-foreground">total reviews</span>
            </div>
            <ResponsiveContainer width="100%" height={190} minWidth={0}>
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={67} outerRadius={87} paddingAngle={data.length > 1 ? 2 : 0} dataKey="value" stroke="var(--card)" strokeWidth={2} startAngle={90} endAngle={-270} isAnimationActive={false}>
                        {data.map(item => <Cell key={item.name} fill={item.color} />)}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} formatter={v => [`${Number(v).toLocaleString()} reviews`, "Count"]} />
                </PieChart>
            </ResponsiveContainer>
        </div>
        <ul className="divide-y divide-border">
            {data.map(item => <li key={item.name} className="flex items-center gap-2.5 py-2.5 text-xs">
                <span className="size-2 shrink-0 rounded-sm" style={{ background: item.color }} aria-hidden />
                <span className="flex-1 text-muted-foreground">{item.name}</span>
                <span className="font-medium tabular-nums">{item.value.toLocaleString()}</span>
                <span className="w-12 text-right tabular-nums text-muted-foreground">{Math.round(item.value / total * 100)}%</span>
            </li>)}
        </ul>
    </div>;
}
