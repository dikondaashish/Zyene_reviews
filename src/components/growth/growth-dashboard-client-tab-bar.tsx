"use client";

import { cn } from "@/lib/utils";
import type { GrowthDashboardTabId } from "./growth-dashboard-client-types";

interface GrowthDashboardClientTabBarProps {
    tab: GrowthDashboardTabId;
    onTab: (t: GrowthDashboardTabId) => void;
    auditErrors: number;
}

export function GrowthDashboardClientTabBar({ tab, onTab, auditErrors }: GrowthDashboardClientTabBarProps) {
    const tabs: { id: GrowthDashboardTabId; label: string }[] = [
        { id: "kpis", label: "KPI dashboard" },
        { id: "pages", label: "Page architecture" },
        { id: "matrix", label: "Priority matrix" },
        { id: "audit", label: auditErrors > 0 ? `Audit (${auditErrors})` : "Audit" },
    ];

    return (
        <nav
            className="flex flex-wrap gap-1 border-b border-border -mx-1 px-1"
            aria-label="Growth dashboard sections"
        >
            {tabs.map((t) => {
                const active = tab === t.id;
                return (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => onTab(t.id)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                            "relative px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors rounded-t-md",
                            active
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                        )}
                    >
                        {t.label}
                        {active ? (
                            <span
                                className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary"
                                aria-hidden
                            />
                        ) : null}
                        {t.id === "audit" && auditErrors === 0 && tab !== "audit" ? (
                            <span className="ml-1 text-chart-2" aria-hidden>
                                ✓
                            </span>
                        ) : null}
                    </button>
                );
            })}
        </nav>
    );
}
