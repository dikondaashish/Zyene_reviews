"use client";

export function GrowthDashboardStatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
        </div>
    );
}

export function GrowthDashboardLeadCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border border-border px-3 py-2">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-semibold tabular-nums">{value}</p>
        </div>
    );
}
