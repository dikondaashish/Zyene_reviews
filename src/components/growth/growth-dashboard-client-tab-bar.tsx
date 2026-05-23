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
        { id: "audit", label: auditErrors > 0 ? `Audit (${auditErrors})` : "Audit ✓" },
    ];

    return (
        <div className="flex flex-wrap gap-2 border-b border-border pb-2">
            {tabs.map((t) => (
                <button
                    key={t.id}
                    type="button"
                    onClick={() => onTab(t.id)}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-t-md transition-colors",
                        tab === t.id
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
}
