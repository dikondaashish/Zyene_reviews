"use client";

export { GrowthDashboardStatCard } from "./growth-dashboard-ui";

/** @deprecated Use GrowthDashboardStatCard — kept for import stability */
export function GrowthDashboardLeadCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-xl border border-border/80 bg-card px-4 py-3 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
        </div>
    );
}
