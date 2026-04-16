"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

interface ThemeDataPoint {
    theme: string;
    count: number;
    sentimentScore: number; // >0 positive, <0 negative
}

export function ThemeChart({ data }: { data: ThemeDataPoint[] }) {
    if (data.length === 0) {
        return (
            <div className="flex h-[320px] items-center justify-center border border-dashed rounded-xl bg-muted/5">
                <p className="text-sm text-muted-foreground font-medium italic">
                    No theme data detected in reviews yet.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full h-[320px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="theme"
                        type="category"
                        tick={{ fontSize: 11, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }}
                        width={90}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => value.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    />
                    <Tooltip
                        cursor={{ fill: "hsl(var(--muted)/0.2)", radius: 4 }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload as ThemeDataPoint;
                                return (
                                    <div className="rounded-lg border bg-background/90 backdrop-blur-md p-3 ring-1 ring-border">
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                                {data.theme.replace(/_/g, " ")}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${data.sentimentScore >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                <p className="text-sm font-bold text-foreground">
                                                    {data.count} {data.count === 1 ? 'mention' : 'mentions'}
                                                </p>
                                            </div>
                                            <p className={`text-[10px] font-bold ${data.sentimentScore >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {data.sentimentScore >= 0 ? 'Positive Sentiment' : 'Negative Sentiment'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24} minPointSize={2}>
                        {data.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill="#c5c0b1" 
                                fillOpacity={0.8}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
