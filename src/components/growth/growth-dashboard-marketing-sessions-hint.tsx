"use client";

import { GrowthDashboardInfoCallout } from "./growth-dashboard-ui";

/** Shown when optional marketing session env is unset (not an error). */
export function GrowthDashboardMarketingSessionsHint() {
    return (
        <GrowthDashboardInfoCallout>
            Set{" "}
            <code className="rounded bg-background px-1 py-0.5 font-mono text-[10px]">
                GROWTH_MARKETING_SESSIONS_30D
            </code>{" "}
            to calculate visitor → signup conversion. See{" "}
            <code className="rounded bg-background px-1 py-0.5 font-mono text-[10px]">
                docs/GROWTH_OPERATIONS.md
            </code>{" "}
            for Vercel / GA session updates.
        </GrowthDashboardInfoCallout>
    );
}
