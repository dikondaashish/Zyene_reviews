"use client";

import type { ReactNode } from "react";
import { KPI_DEFINITIONS, type KpiCategory } from "@/lib/growth/kpi-definitions";
import type { KpiMetricValue } from "@/lib/growth/kpi-metrics";
import { GROWTH_DASHBOARD_CATEGORY_LABELS } from "./growth-dashboard-client-types";
import { GrowthDashboardKpiRow } from "./growth-dashboard-kpi-row";

interface GrowthDashboardTabKpisSectionProps {
    metricById: Record<string, KpiMetricValue | undefined>;
}

export function GrowthDashboardTabKpisSection({ metricById }: GrowthDashboardTabKpisSectionProps) {
    return (
        <section className="space-y-8">
            {(["acquisition", "conversion", "retention", "plg"] as KpiCategory[]).map((cat) => (
                <div key={cat}>
                    <h2 className="text-lg font-semibold mb-3">{GROWTH_DASHBOARD_CATEGORY_LABELS[cat]}</h2>
                    <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="w-full text-left min-w-[720px]">
                            <thead>
                                <tr className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                                    <th className="py-2 px-3 font-medium">Metric</th>
                                    <th className="py-2 px-2 font-medium">Source</th>
                                    <th className="py-2 px-2 font-medium">Target</th>
                                    <th className="py-2 px-2 font-medium">Current</th>
                                    <th className="py-2 px-3 font-medium">Status</th>
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
                                        />
                                    );
                                    return acc;
                                }, [])}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </section>
    );
}
