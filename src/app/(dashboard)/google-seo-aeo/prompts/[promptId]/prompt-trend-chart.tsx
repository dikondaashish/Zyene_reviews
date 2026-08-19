"use client";

import { useSyncExternalStore } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { EngineTrend } from "./load-prompt-detail";

const LINE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const subscribeToClientReady = () => () => {};
const clientReadySnapshot = () => true;
const serverReadySnapshot = () => false;

/** F4.5: one prompt's visibility rate per engine, week over week. Gaps (null) render as broken lines, never interpolated. */
export function PromptTrendChart({ trend, weeks }: { trend: EngineTrend[]; weeks: string[] }) {
    const mounted = useSyncExternalStore(subscribeToClientReady, clientReadySnapshot, serverReadySnapshot);

    if (trend.length === 0) {
        return (
            <div className="flex h-62.5 items-center justify-center text-sm text-muted-foreground">
                No samples for this prompt yet.
            </div>
        );
    }
    if (!mounted) return <div className="mt-2 h-[250px] w-full min-w-0" />;

    const data = weeks.map((week, i) => {
        const row: Record<string, string | number | null> = { week };
        for (const engine of trend) {
            row[engine.engineId] = engine.points[i]?.rate === null ? null : (engine.points[i].rate as number) * 100;
        }
        return row;
    });

    return (
        <div className="mt-2 h-[250px] w-full min-w-0">
            <ResponsiveContainer width="100%" height={250} minWidth={0} debounce={50}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="color-mix(in oklab, var(--border) 60%, transparent)" />
                    <XAxis
                        dataKey="week"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                        interval="preserveStartEnd"
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                        domain={[0, 100]}
                        tickFormatter={(v: number) => `${v}%`}
                        dx={-5}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "var(--card)",
                            borderRadius: "12px",
                            border: "1px solid var(--border)",
                            boxShadow: "var(--shadow-sm)",
                        }}
                        formatter={(value) => (value === null ? ["No data", ""] : [`${Number(value).toFixed(0)}%`, ""])}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {trend.map((engine, i) => (
                        <Line
                            key={engine.engineId}
                            type="monotone"
                            dataKey={engine.engineId}
                            stroke={LINE_COLORS[i % LINE_COLORS.length]}
                            strokeWidth={2}
                            connectNulls={false}
                            dot={{ r: 2.5, strokeWidth: 0 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
