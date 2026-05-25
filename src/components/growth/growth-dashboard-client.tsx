"use client";

import type { GrowthKpiSnapshot } from "@/lib/growth/kpi-metrics";
import type { BlueprintAuditItem } from "@/lib/growth/growth-blueprint-audit";
import type { LocalSeoChecklistLeadReport } from "@/lib/marketing/local-seo-checklist-lead-report";
import type { TemplatePackLeadReport } from "@/lib/marketing/template-pack-lead-report";
import { GrowthDashboardLeadMagnetFunnels } from "./growth-dashboard-lead-magnet-funnels";
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
    templatePackReport,
    localSeoChecklistReport,
}: {
    snapshot: GrowthKpiSnapshot;
    auditItems: BlueprintAuditItem[];
    auditSummary: { errors: number; warnings: number; info: number; passed: boolean };
    templatePackReport: TemplatePackLeadReport;
    localSeoChecklistReport: LocalSeoChecklistLeadReport;
}) {
    const s = useGrowthDashboardClientState(snapshot);

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10 space-y-6 sm:space-y-8">
            <GrowthDashboardClientHeaderSummary snapshot={s.snapshot} pageSummary={s.pageSummary} />
            <GrowthDashboardClientTabBar tab={s.tab} onTab={s.setTab} auditErrors={auditSummary.errors} />

            <div className="pt-2 min-w-0">
                {s.tab === "kpis" ? (
                    <div className="space-y-8">
                        <GrowthDashboardLeadMagnetFunnels
                            templatePackReport={templatePackReport}
                            localSeoChecklistReport={localSeoChecklistReport}
                        />
                        <GrowthDashboardTabKpisSection
                            metricById={s.metricById}
                            marketingSessionsConfigured={snapshot.marketingSessionsConfigured}
                        />
                    </div>
                ) : null}
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
        </div>
    );
}
