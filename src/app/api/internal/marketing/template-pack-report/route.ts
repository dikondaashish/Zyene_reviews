import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    growthDashboardCookieName,
    isAuthorizedGrowthDashboardRequest,
    verifyGrowthDashboardToken,
} from "@/lib/growth/growth-dashboard-auth";
import { fetchTemplatePackLeadReport } from "@/lib/marketing/template-pack-lead-report";

export const dynamic = "force-dynamic";

/**
 * GET /api/internal/marketing/template-pack-report?days=30
 * Template pack lead magnet funnel (views, submits, conversion, latest leads).
 * Auth: GROWTH_DASHBOARD_SECRET Bearer or growth_dashboard cookie.
 */
export async function GET(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get(growthDashboardCookieName())?.value;
    const cookieOk = verifyGrowthDashboardToken(token);
    if (!cookieOk && !isAuthorizedGrowthDashboardRequest(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const days = Math.min(90, Math.max(1, Number(url.searchParams.get("days") ?? "30") || 30));

    try {
        const report = await fetchTemplatePackLeadReport(days);
        return NextResponse.json(report);
    } catch (err) {
        logger.error({ err }, "[template-pack-report]");
        return NextResponse.json({ error: "Failed to load report" }, { status: 500 });
    }
}
