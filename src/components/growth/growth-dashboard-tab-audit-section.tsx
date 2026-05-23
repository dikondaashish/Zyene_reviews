"use client";

import { cn } from "@/lib/utils";
import type { BlueprintAuditItem } from "@/lib/growth/growth-blueprint-audit";

interface GrowthDashboardTabAuditSectionProps {
    auditItems: BlueprintAuditItem[];
    auditSummary: { errors: number; warnings: number; info: number; passed: boolean };
}

export function GrowthDashboardTabAuditSection({ auditItems, auditSummary }: GrowthDashboardTabAuditSectionProps) {
    return (
        <section className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Automated checks for blueprint §§14–16.{" "}
                {auditSummary.passed ? (
                    <span className="text-chart-2 font-medium">No blocking errors.</span>
                ) : (
                    <span className="text-destructive font-medium">Fix errors below.</span>
                )}{" "}
                ({auditSummary.errors} errors, {auditSummary.warnings} warnings, {auditSummary.info} notes)
            </p>
            <ul className="space-y-2">
                {auditItems.map((item) => (
                    <li
                        key={item.id}
                        className={cn(
                            "rounded-lg border px-4 py-3 text-sm",
                            item.severity === "error"
                                ? "border-destructive/40 bg-destructive/5"
                                : item.severity === "warning"
                                  ? "border-chart-4/30 bg-chart-4/5"
                                  : "border-border bg-card",
                        )}
                    >
                        <span className="font-medium capitalize">{item.severity}</span>
                        <span className="text-muted-foreground"> · {item.area}</span>
                        <p className="mt-1">{item.message}</p>
                        {item.remediation ? (
                            <p className="text-xs text-muted-foreground mt-1">→ {item.remediation}</p>
                        ) : null}
                    </li>
                ))}
            </ul>
        </section>
    );
}
