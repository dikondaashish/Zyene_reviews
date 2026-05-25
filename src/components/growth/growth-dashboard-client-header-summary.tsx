"use client";

import type { GrowthKpiSnapshot } from "@/lib/growth/kpi-metrics";
import { GrowthDashboardStatCard } from "./growth-dashboard-ui";

interface GrowthDashboardClientHeaderSummaryProps {
    snapshot: GrowthKpiSnapshot;
    pageSummary: { total: number; inSitemap: number; live: number };
}

export function GrowthDashboardClientHeaderSummary({
    snapshot,
    pageSummary,
}: GrowthDashboardClientHeaderSummaryProps) {
    return (
        <header className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2 min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Internal · Growth blueprint
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Growth operations center</h1>
                    <p className="text-sm text-muted-foreground max-w-xl">
                        Product KPIs, lead magnets, and implementation status for the marketing site.
                    </p>
                </div>
                <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                    Last 30 days
                </span>
            </div>

            <p className="text-xs text-muted-foreground">
                Docs:{" "}
                <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
                    docs/GROWTH_BLUEPRINT.md
                </span>
                <span className="mx-2 text-border">·</span>
                Runbook:{" "}
                <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
                    docs/GROWTH_OPERATIONS.md
                </span>
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <GrowthDashboardStatCard
                    label="New signups"
                    value={String(snapshot.counts.signupsInPeriod)}
                    hint="Unique orgs with signup in period"
                />
                <GrowthDashboardStatCard
                    label="Paid"
                    value={String(snapshot.counts.activePaidOrgs)}
                    hint={
                        snapshot.counts.billingSource === "stripe"
                            ? "Active Stripe subscriptions"
                            : "Orgs with paid plan + Stripe sub ID"
                    }
                />
                <GrowthDashboardStatCard
                    label="Trialing"
                    value={String(snapshot.counts.trialingOrgs)}
                    hint={
                        snapshot.counts.billingSource === "stripe"
                            ? "Trialing Stripe subscriptions"
                            : "Orgs trialing with Stripe sub ID"
                    }
                />
                <GrowthDashboardStatCard
                    label="Live URLs"
                    value={String(pageSummary.live)}
                    hint={`${pageSummary.inSitemap} in sitemap`}
                />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <GrowthDashboardStatCard
                    label="Newsletter leads"
                    value={String(snapshot.leads.newsletterSubscribers)}
                    hint="Marketing subscribers"
                />
                <GrowthDashboardStatCard
                    label="Demo requests"
                    value={String(snapshot.leads.demoRequests)}
                    hint="Contact / demo forms"
                />
                <GrowthDashboardStatCard
                    label="Free-tool leads"
                    value={String(snapshot.leads.freeToolLeads)}
                    hint="Tool usage captures"
                />
                <GrowthDashboardStatCard
                    label="Partner / agency"
                    value={String(snapshot.leads.partnerLeads)}
                    hint="Partner waitlist"
                />
            </div>
        </header>
    );
}
