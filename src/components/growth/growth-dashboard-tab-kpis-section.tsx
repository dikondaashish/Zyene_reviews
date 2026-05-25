"use client";

import type { ReactNode } from "react";
import { KPI_DEFINITIONS, type KpiCategory } from "@/lib/growth/kpi-definitions";
import type { KpiMetricValue } from "@/lib/growth/kpi-metrics";
import { GROWTH_DASHBOARD_CATEGORY_LABELS } from "./growth-dashboard-client-types";
import { GrowthDashboardKpiRow } from "./growth-dashboard-kpi-row";
import { GrowthDashboardMarketingSessionsHint } from "./growth-dashboard-marketing-sessions-hint";
import { GrowthDashboardTableShell } from "./growth-dashboard-ui";

interface GrowthDashboardTabKpisSectionProps {
    metricById: Record<string, KpiMetricValue | undefined>;
    marketingSessionsConfigured: boolean;
}

export function GrowthDashboardTabKpisSection({
    metricById,
    marketingSessionsConfigured,
}: GrowthDashboardTabKpisSectionProps) {
    return (
        <section className="space-y-8">
            {(["acquisition", "conversion", "retention", "plg"] as KpiCategory[]).map((cat) => (
                <div key={cat} className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-base font-semibold tracking-tight">
                            {GROWTH_DASHBOARD_CATEGORY_LABELS[cat]}
                        </h2>
                        {cat === "acquisition" && !marketingSessionsConfigured ? (
                            <GrowthDashboardMarketingSessionsHint />
                        ) : null}
                    </div>
                    <GrowthDashboardTableShell>
                        <table className="w-full text-left min-w-[680px]">
                            <thead>
                                <tr className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                                    <th className="py-2.5 px-3 font-medium w-[40%]">Metric</th>
                                    <th className="py-2.5 px-2 font-medium">Source</th>
                                    <th className="py-2.5 px-2 font-medium">Target</th>
                                    <th className="py-2.5 px-2 font-medium">Current</th>
                                    <th className="py-2.5 px-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {KPI_DEFINITIONS.reduce<ReactNode[]>((acc, def) => {
                                    if (def.category !== cat) return acc;
                                    acc.push(
                                        <GrowthDashboardKpiRow
                                            key={def.id}
                                            def={def}
                                            metric={metricById[def.id]}
                                        />,
                                    );
                                    return acc;
                                }, [])}
                            </tbody>
                        </table>
                    </GrowthDashboardTableShell>
                </div>
            ))}
        </section>
    );
}
