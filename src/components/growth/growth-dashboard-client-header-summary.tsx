"use client";

import type { GrowthKpiSnapshot } from "@/lib/growth/kpi-metrics";
import { GrowthDashboardStatCard, GrowthDashboardLeadCard } from "./growth-dashboard-stat-lead-cards";

interface GrowthDashboardClientHeaderSummaryProps {
    snapshot: GrowthKpiSnapshot;
    pageSummary: { total: number; inSitemap: number; live: number };
}

export function GrowthDashboardClientHeaderSummary({
    snapshot,
    pageSummary,
}: GrowthDashboardClientHeaderSummaryProps) {
    return (
        <>
            <header className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Internal · Growth blueprint
                </p>
                <h1 className="text-3xl font-bold tracking-tight">Growth operations center</h1>
                <p className="text-muted-foreground text-sm max-w-2xl">
                    Live product metrics ({snapshot.periodLabel}), full URL inventory, and phased implementation
                    status. Source of truth:{" "}
                    <code className="text-xs bg-muted px-1 rounded">docs/GROWTH_BLUEPRINT.md</code>
                    {" · "}
                    runbook: <code className="text-xs bg-muted px-1 rounded">docs/GROWTH_OPERATIONS.md</code>
                </p>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <GrowthDashboardStatCard label="Signups (period)" value={String(snapshot.counts.signupsInPeriod)} />
                <GrowthDashboardStatCard label="Paid orgs" value={String(snapshot.counts.activePaidOrgs)} />
                <GrowthDashboardStatCard label="Trialing" value={String(snapshot.counts.trialingOrgs)} />
                <GrowthDashboardStatCard label="Live URLs" value={String(pageSummary.live)} />
            </div>

            <div className="grid sm:grid-cols-4 gap-3 text-sm">
                <GrowthDashboardLeadCard label="Newsletter leads" value={snapshot.leads.newsletterSubscribers} />
                <GrowthDashboardLeadCard label="Demo requests" value={snapshot.leads.demoRequests} />
                <GrowthDashboardLeadCard label="Free-tool leads" value={snapshot.leads.freeToolLeads} />
                <GrowthDashboardLeadCard label="Partner / agency" value={snapshot.leads.partnerLeads} />
            </div>
        </>
    );
}
