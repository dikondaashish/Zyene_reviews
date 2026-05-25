"use client";

import type { TemplatePackLeadReport } from "@/lib/marketing/template-pack-lead-report";
import type { LocalSeoChecklistLeadReport } from "@/lib/marketing/local-seo-checklist-lead-report";
import {
    GrowthDashboardEmptyState,
    GrowthDashboardFunnelMetric,
    GrowthDashboardLeadsTable,
    formatFunnelConversion,
} from "./growth-dashboard-ui";

type LeadReport = TemplatePackLeadReport | LocalSeoChecklistLeadReport;

function isEmptyReport(report: LeadReport): boolean {
    return (
        report.pageViews === 0 &&
        report.submissions === 0 &&
        report.subscribeSuccesses === 0 &&
        report.signupClicks === 0 &&
        report.pricingClicks === 0 &&
        report.latestSubmissions.length === 0
    );
}

export function GrowthDashboardFunnelCard({
    title,
    pagePath,
    report,
}: {
    title: string;
    pagePath: string;
    report: LeadReport;
}) {
    const empty = isEmptyReport(report);
    const conversion = formatFunnelConversion(report.conversionRatePercent, {
        hasTraffic: report.pageViews > 0,
        hasLeads: report.subscribeSuccesses > 0,
    });

    return (
        <article className="rounded-xl border border-border/80 bg-card p-5 shadow-sm">
            <header className="mb-4 border-b border-border/60 pb-3">
                <h3 className="text-base font-semibold tracking-tight">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                    <code className="rounded bg-muted px-1 py-0.5 text-[10px]">{pagePath}</code>
                    <span className="mx-1.5">·</span>
                    Last {report.periodDays} days
                    {report.excludesQaTraffic ? " · QA excluded" : null}
                </p>
            </header>

            {empty ? (
                <GrowthDashboardEmptyState
                    title="No real lead submissions yet"
                    description="No page views or form events in this period. QA traffic is excluded from production metrics."
                />
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        <GrowthDashboardFunnelMetric label="Page views" value={report.pageViews} />
                        <GrowthDashboardFunnelMetric label="Form submits" value={report.submissions} />
                        <GrowthDashboardFunnelMetric label="Subscribe OK" value={report.subscribeSuccesses} />
                        <GrowthDashboardFunnelMetric
                            label="Conversion"
                            value={conversion.value}
                            sub={conversion.sub}
                        />
                        <GrowthDashboardFunnelMetric label="Signup clicks" value={report.signupClicks} />
                        <GrowthDashboardFunnelMetric label="Pricing clicks" value={report.pricingClicks} />
                    </div>
                    <GrowthDashboardLeadsTable rows={report.latestSubmissions} />
                </>
            )}
        </article>
    );
}
