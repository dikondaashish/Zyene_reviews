"use client";

import type { GrowthKpiSnapshot } from "@/lib/growth/kpi-metrics";
import type { BlueprintAuditItem } from "@/lib/growth/growth-blueprint-audit";
import { useGrowthDashboardClientState } from "./use-growth-dashboard-client-state";
import { GrowthDashboardClientHeaderSummary } from "./growth-dashboard-client-header-summary";
import { GrowthDashboardClientTabBar } from "./growth-dashboard-client-tab-bar";
import { GrowthDashboardTabKpisSection } from "./growth-dashboard-tab-kpis-section";
import { GrowthDashboardTabPagesSection } from "./growth-dashboard-tab-pages-section";
import { GrowthDashboardTabAuditSection } from "./growth-dashboard-tab-audit-section";
import { GrowthDashboardTabMatrixSection } from "./growth-dashboard-tab-matrix-section";

export function GrowthDashboardClient({
    snapshot,
    auditItems,
    auditSummary,
}: {
    snapshot: GrowthKpiSnapshot;
    auditItems: BlueprintAuditItem[];
    auditSummary: { errors: number; warnings: number; info: number; passed: boolean };
}) {
    const s = useGrowthDashboardClientState(snapshot);

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
            <GrowthDashboardClientHeaderSummary snapshot={s.snapshot} pageSummary={s.pageSummary} />
            <GrowthDashboardClientTabBar tab={s.tab} onTab={s.setTab} auditErrors={auditSummary.errors} />

            {s.tab === "kpis" ? <GrowthDashboardTabKpisSection metricById={s.metricById} /> : null}
            {s.tab === "pages" ? (
                <GrowthDashboardTabPagesSection
                    pageSummary={s.pageSummary}
                    pageFilter={s.pageFilter}
                    onPageFilter={s.setPageFilter}
                    filteredPages={s.filteredPages}
                />
            ) : null}
            {s.tab === "audit" ? (
                <GrowthDashboardTabAuditSection auditItems={auditItems} auditSummary={auditSummary} />
            ) : null}
            {s.tab === "matrix" ? <GrowthDashboardTabMatrixSection matrixSummary={s.matrixSummary} /> : null}
        </div>
    );
}
