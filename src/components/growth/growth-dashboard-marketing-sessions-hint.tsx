"use client";

/** Neutral helper when optional marketing session env is unset (not an error). */
export function GrowthDashboardMarketingSessionsHint() {
    return (
        <p className="text-sm text-muted-foreground rounded-lg border border-border bg-muted/30 px-4 py-3 max-w-2xl">
            Set <code className="text-xs bg-muted px-1 rounded">GROWTH_MARKETING_SESSIONS_30D</code> to
            calculate visitor → signup conversion. See{" "}
            <code className="text-xs bg-muted px-1 rounded">docs/GROWTH_OPERATIONS.md</code> for how to
            set it in Vercel and how often to update it manually.
        </p>
    );
}
