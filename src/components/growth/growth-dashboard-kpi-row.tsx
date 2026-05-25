"use client";

import { cn } from "@/lib/utils";
import type { KpiDefinition } from "@/lib/growth/kpi-definitions";
import type { KpiMetricValue } from "@/lib/growth/kpi-metrics";
import { growthDashboardStatusBadgeClass } from "./growth-dashboard-status-badge";

export function GrowthDashboardKpiRow({ def, metric }: { def: KpiDefinition; metric: KpiMetricValue | undefined }) {
    const status = metric?.status ?? (def.computable ? "unknown" : "external");
    const externalLink = def.externalUrl ? (
        <a
            href={def.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
        >
            ↗
        </a>
    ) : null;

    return (
        <tr className="border-b border-border/60 last:border-0 hover:bg-muted/20">
            <td className="py-3 pr-3 align-top">
                <div className="font-medium text-sm leading-snug">{def.name}</div>
                <div className="text-xs text-muted-foreground mt-1 max-w-md leading-relaxed">{def.description}</div>
            </td>
            <td className="py-3 px-2 text-xs text-muted-foreground align-top max-w-[140px]">
                <span className="inline-flex items-center gap-1">
                    {def.source}
                    {externalLink}
                </span>
            </td>
            <td className="py-3 px-2 text-sm align-top whitespace-nowrap text-muted-foreground">
                {def.targetLabel}
            </td>
            <td className="py-3 px-2 text-sm font-mono align-top whitespace-nowrap">
                {metric?.displayValue ?? "—"}
            </td>
            <td className="py-3 pl-2 align-top min-w-[120px]">
                <span
                    className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                        growthDashboardStatusBadgeClass(status),
                    )}
                >
                    {status.replace("_", " ")}
                </span>
                {metric?.note ? (
                    <p className="text-[11px] text-muted-foreground mt-1.5 max-w-xs leading-snug">{metric.note}</p>
                ) : null}
            </td>
        </tr>
    );
}
