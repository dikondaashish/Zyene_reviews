"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GrowthDashboardStatCard({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint?: string;
}) {
    return (
        <div className="rounded-xl border border-border/80 bg-card px-4 py-3 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
            {hint ? <p className="mt-1 text-xs text-muted-foreground leading-snug">{hint}</p> : null}
        </div>
    );
}

export function GrowthDashboardInfoCallout({ children }: { children: ReactNode }) {
    return (
        <div
            role="note"
            className="flex gap-2 rounded-lg border border-border/80 bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground leading-relaxed max-w-3xl"
        >
            <span className="shrink-0 text-base leading-none" aria-hidden>
                ℹ
            </span>
            <div>{children}</div>
        </div>
    );
}

export function GrowthDashboardEmptyState({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center">
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">{description}</p>
        </div>
    );
}

export function GrowthDashboardFunnelMetric({
    label,
    value,
    sub,
}: {
    label: string;
    value: string | number;
    sub?: string;
}) {
    return (
        <div className="rounded-lg border border-border/60 bg-background/80 px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
            {sub ? <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p> : null}
        </div>
    );
}

export type GrowthDashboardLeadRow = {
    subscribed_at: string;
    source: string;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
};

export function GrowthDashboardLeadsTable({ rows }: { rows: GrowthDashboardLeadRow[] }) {
    if (rows.length === 0) return null;

    return (
        <div className="mt-4 overflow-x-auto rounded-lg border border-border/80">
            <table className="w-full text-left text-sm min-w-[420px]">
                <thead>
                    <tr className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <th className="py-2 px-3 font-medium">Subscribed</th>
                        <th className="py-2 px-3 font-medium">Source</th>
                        <th className="py-2 px-3 font-medium">UTM</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={`${row.subscribed_at}-${row.source}-${row.utm_source ?? ""}`}
                            className="border-b border-border/50 last:border-0"
                        >
                            <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">
                                {new Date(row.subscribed_at).toLocaleString()}
                            </td>
                            <td className="py-2 px-3">{row.source}</td>
                            <td className="py-2 px-3 text-muted-foreground">
                                {[row.utm_source, row.utm_medium, row.utm_campaign]
                                    .filter(Boolean)
                                    .join(" / ") || "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="text-[10px] text-muted-foreground px-3 py-2 border-t border-border/60">
                Source and UTM only — emails stay in the database.
            </p>
        </div>
    );
}

export function formatFunnelConversion(
    rate: number | null,
    opts: { hasTraffic: boolean; hasLeads: boolean },
): { value: string; sub?: string } {
    if (!opts.hasTraffic && !opts.hasLeads) {
        return { value: "—", sub: "No traffic in period" };
    }
    if (rate === null || (!opts.hasLeads && opts.hasTraffic)) {
        return { value: "0%", sub: "No real leads yet. QA traffic is excluded." };
    }
    return { value: `${rate}%`, sub: "Views → subscribe OK" };
}

export function GrowthDashboardTableShell({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("overflow-x-auto rounded-xl border border-border/80 shadow-sm", className)}>
            {children}
        </div>
    );
}
