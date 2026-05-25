import type { Metadata } from "next";
import { cookies } from "next/headers";
import { GrowthDashboardGate } from "@/components/growth/growth-dashboard-gate";
import { GrowthDashboardClient } from "@/components/growth/growth-dashboard-client";
import {
    getGrowthDashboardSecret,
    growthDashboardCookieName,
    verifyGrowthDashboardToken,
} from "@/lib/growth/growth-dashboard-auth";
import { fetchGrowthKpiSnapshot } from "@/lib/growth/kpi-metrics";
import { runGrowthBlueprintAudit, summarizeBlueprintAudit } from "@/lib/growth/growth-blueprint-audit";
import { fetchTemplatePackLeadReport } from "@/lib/marketing/template-pack-lead-report";

export const metadata: Metadata = {
    title: "Growth operations",
    robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function GrowthOperationsPage() {
    const secret = getGrowthDashboardSecret();
    if (!secret) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center px-4 text-center text-sm text-muted-foreground">
                Growth dashboard is disabled. Set{" "}
                <code className="mx-1 bg-muted px-1 rounded">GROWTH_DASHBOARD_SECRET</code> in the
                environment.
            </div>
        );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(growthDashboardCookieName())?.value;
    if (!verifyGrowthDashboardToken(token)) {
        return <GrowthDashboardGate />;
    }

    const [snapshot, auditItems, templatePackReport] = await Promise.all([
        fetchGrowthKpiSnapshot(30),
        Promise.resolve(runGrowthBlueprintAudit()),
        fetchTemplatePackLeadReport(30),
    ]);
    const auditSummary = summarizeBlueprintAudit(auditItems);
    return (
        <GrowthDashboardClient
            snapshot={snapshot}
            auditItems={auditItems}
            auditSummary={auditSummary}
            templatePackReport={templatePackReport}
        />
    );
}
