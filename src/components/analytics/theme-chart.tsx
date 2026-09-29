"use client";

import { ChartEmpty } from "@/components/analytics/chart-presentation";
interface ThemeDataPoint { theme: string; count: number; sentimentScore: number }

export function ThemeChart({ data }: { data: ThemeDataPoint[] }) {
    if (!data.length) return <ChartEmpty message="No recurring themes yet" />;
    const sorted = [...data].sort((a, b) => b.count - a.count);
    const max = Math.max(...sorted.map(d => d.count), 1);
    return <div className="space-y-5">
        <div className="flex justify-between text-xs text-muted-foreground"><span>Topic</span><span>Mentions</span></div>
        <ol className="max-h-[278px] space-y-4 overflow-y-auto pr-1" aria-label="Themes ranked by number of mentions" tabIndex={0}>
            {sorted.map(item => {
                const tone = item.sentimentScore / item.count >= 0.2 ? "Positive leaning" : item.sentimentScore / item.count <= -0.2 ? "Negative leaning" : "Balanced";
                const color = tone === "Positive leaning" ? "var(--chart-2)" : tone === "Negative leaning" ? "var(--destructive)" : "var(--chart-3)";
                return <li key={item.theme} className="space-y-2">
                    <div className="flex items-start justify-between gap-3 text-sm">
                        <span className="min-w-0 break-words capitalize">{item.theme}</span><span className="font-medium tabular-nums">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-sm bg-muted" role="img" aria-label={`${item.theme}: ${item.count} mentions, ${tone.toLowerCase()}`}>
                        <div className="h-full rounded-sm" style={{ width: `${item.count / max * 100}%`, background: color }} />
                    </div>
                    <p className="text-xs text-muted-foreground">{tone}</p>
                </li>;
            })}
        </ol>
        <p className="text-xs text-muted-foreground">Themes mentioned at least twice. A review can include multiple topics.</p>
    </div>;
}
