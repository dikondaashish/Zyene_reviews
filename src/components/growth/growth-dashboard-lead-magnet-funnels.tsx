"use client";

import type { LocalSeoChecklistLeadReport } from "@/lib/marketing/local-seo-checklist-lead-report";
import type { TemplatePackLeadReport } from "@/lib/marketing/template-pack-lead-report";
import { GrowthDashboardFunnelCard } from "./growth-dashboard-funnel-card";

export function GrowthDashboardLeadMagnetFunnels({
    templatePackReport,
    localSeoChecklistReport,
}: {
    templatePackReport: TemplatePackLeadReport;
    localSeoChecklistReport: LocalSeoChecklistLeadReport;
}) {
    return (
        <section className="space-y-4" aria-labelledby="lead-magnet-funnels-heading">
            <div>
                <h2 id="lead-magnet-funnels-heading" className="text-base font-semibold tracking-tight">
                    Lead magnet funnels
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Resource downloads and checklist opt-ins for the last {templatePackReport.periodDays} days.
                </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
                <GrowthDashboardFunnelCard
                    title="Template pack"
                    pagePath="/resources/review-request-templates"
                    report={templatePackReport}
                />
                <GrowthDashboardFunnelCard
                    title="Local SEO checklist"
                    pagePath="/resources/local-seo-checklist"
                    report={localSeoChecklistReport}
                />
            </div>
        </section>
    );
}
