"use client";

import { Eye, MapPin, MousePointer2, Phone } from "lucide-react";

interface EngagementFunnelCardProps { profileViews: number; websiteClicks: number; callClicks: number; directionRequests: number }

export function EngagementFunnelCard({ profileViews, websiteClicks, callClicks, directionRequests }: EngagementFunnelCardProps) {
    const metrics = [
        { label: "Profile views", value: profileViews, icon: Eye, color: "var(--primary)" },
        { label: "Website clicks", value: websiteClicks, icon: MousePointer2, color: "var(--chart-5)" },
        { label: "Direction requests", value: directionRequests, icon: MapPin, color: "var(--primary)" },
        { label: "Call clicks", value: callClicks, icon: Phone, color: "var(--chart-2)" },
    ];
    return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Google performance totals for the selected period">
        {metrics.map(metric => <div key={metric.label} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted" style={{ color: metric.color }}><metric.icon className="size-5" strokeWidth={1.75} aria-hidden /></span>
            <div className="min-w-0 space-y-1"><p className="text-xs text-muted-foreground">{metric.label}</p><p className="text-2xl font-semibold tracking-tight tabular-nums">{metric.value.toLocaleString()}</p></div>
        </div>)}
    </div>;
}
