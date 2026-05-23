"use client";

import { cn } from "@/lib/utils";
import { GROWTH_IMPLEMENTATION_MATRIX } from "@/lib/growth/implementation-matrix";
import { growthDashboardStatusBadgeClass } from "./growth-dashboard-status-badge";

interface GrowthDashboardTabMatrixSectionProps {
    matrixSummary: {
        complete: number;
        total: number;
        ongoing: number;
        external: number;
        deferred: number;
    };
}

export function GrowthDashboardTabMatrixSection({ matrixSummary }: GrowthDashboardTabMatrixSectionProps) {
    return (
        <section className="space-y-6">
            <p className="text-sm text-muted-foreground">
                {matrixSummary.complete} / {matrixSummary.total} tasks complete · {matrixSummary.ongoing} ongoing ·{" "}
                {matrixSummary.external} external ops · {matrixSummary.deferred} deferred
            </p>
            {GROWTH_IMPLEMENTATION_MATRIX.map((phase) => (
                <div key={phase.phase} className="rounded-xl border border-border overflow-hidden">
                    <div className="bg-muted/40 px-4 py-3 flex flex-wrap justify-between gap-2">
                        <div>
                            <span className="text-xs font-semibold text-primary">Phase {phase.phase}</span>
                            <h3 className="font-semibold">{phase.title}</h3>
                            <p className="text-xs text-muted-foreground">{phase.weekRange}</p>
                        </div>
                        <span
                            className={cn(
                                "self-start rounded-full px-2 py-0.5 text-xs font-medium",
                                growthDashboardStatusBadgeClass(phase.status === "complete" ? "complete" : "ongoing"),
                            )}
                        >
                            {phase.status}
                        </span>
                    </div>
                    {phase.blocks.map((block) => (
                        <div key={block.weekLabel} className="border-t border-border px-4 py-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">{block.weekLabel}</p>
                            <ul className="space-y-2">
                                {block.tasks.map((task) => (
                                    <li key={task.id} className="flex flex-wrap items-start gap-2 text-sm">
                                        <span
                                            className={cn(
                                                "rounded-full px-2 py-0.5 text-xs shrink-0",
                                                growthDashboardStatusBadgeClass(task.status),
                                            )}
                                        >
                                            {task.status}
                                        </span>
                                        <span className="font-medium">{task.title}</span>
                                        {task.deliverable ? (
                                            <span className="text-muted-foreground text-xs">→ {task.deliverable}</span>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            ))}
        </section>
    );
}
