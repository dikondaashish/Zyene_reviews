import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    growthDashboardCookieName,
    isAuthorizedGrowthDashboardRequest,
    verifyGrowthDashboardToken,
} from "@/lib/growth/growth-dashboard-auth";
import { fetchLocalSeoChecklistLeadReport } from "@/lib/marketing/local-seo-checklist-lead-report";

export const dynamic = "force-dynamic";

/**
 * GET /api/internal/marketing/local-seo-checklist-report?days=30
 * Auth: GROWTH_DASHBOARD_SECRET Bearer or growth_dashboard cookie.
 */
export async function GET(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get(growthDashboardCookieName())?.value;
    const cookieOk = verifyGrowthDashboardToken(token);
    const bearerOk = isAuthorizedGrowthDashboardRequest(request);

    if (!cookieOk && !bearerOk) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const days = Math.min(90, Math.max(1, Number(url.searchParams.get("days") ?? "30") || 30));

    try {
        const report = await fetchLocalSeoChecklistLeadReport(days);
        return NextResponse.json(report);
    } catch (err) {
        logger.error({ err }, "[local-seo-checklist-report]");
        return NextResponse.json({ error: "Failed to load report" }, { status: 500 });
    }
}
