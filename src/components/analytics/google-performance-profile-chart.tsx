"use client";

import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import type { DailyMetricPoint } from "@/services/google/performance-queries";

export function GooglePerformanceProfileChart({ data }: { data: DailyMetricPoint[] }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (data.length === 0) {
        return (
            <div className="flex h-[280px] items-center justify-center text-muted-foreground text-sm">
                No Google listing metrics for this period yet. Sync Google or wait for the daily job.
            </div>
        );
    }

    if (!mounted) {
        return <div className="h-[280px] w-full" />;
    }

    const chartData = data.map((d) => ({
        ...d,
        label: d.date.slice(5),
    }));

    return (
        <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip
                    contentStyle={{ borderRadius: 8 }}
                    labelFormatter={(_, payload) => {
                        const p = payload?.[0]?.payload as DailyMetricPoint & { label?: string };
                        return p?.date ?? "";
                    }}
                />
                <Legend />
                <Line type="monotone" dataKey="profileViews" name="Profile views" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="websiteClicks" name="Website clicks" stroke="#ea580c" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="calls" name="Calls" stroke="#16a34a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="directions" name="Directions" stroke="#7c3aed" strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}
