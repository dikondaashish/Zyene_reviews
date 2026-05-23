"use client";

import { cn } from "@/lib/utils";
import type { KpiDefinition } from "@/lib/growth/kpi-definitions";
import type { KpiMetricValue } from "@/lib/growth/kpi-metrics";
import { growthDashboardStatusBadgeClass } from "./growth-dashboard-status-badge";

export function GrowthDashboardKpiRow({ def, metric }: { def: KpiDefinition; metric: KpiMetricValue | undefined }) {
    const status = metric?.status ?? (def.computable ? "unknown" : "external");
    return (
        <tr className="border-b border-border last:border-0">
            <td className="py-3 pr-4 align-top">
                <div className="font-medium text-sm">{def.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5 max-w-md">{def.description}</div>
            </td>
            <td className="py-3 px-2 text-sm text-muted-foreground align-top whitespace-nowrap">{def.source}</td>
            <td className="py-3 px-2 text-sm align-top whitespace-nowrap">{def.targetLabel}</td>
            <td className="py-3 px-2 text-sm font-mono align-top whitespace-nowrap">{metric?.displayValue ?? "-"}</td>
            <td className="py-3 pl-2 align-top">
                <span
                    className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                        growthDashboardStatusBadgeClass(status),
                    )}
                >
                    {status.replace("_", " ")}
                </span>
                {def.externalUrl ? (
                    <a
                        href={def.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-primary mt-1 hover:underline"
                    >
                        Open source →
                    </a>
                ) : null}
            </td>
        </tr>
    );
}
