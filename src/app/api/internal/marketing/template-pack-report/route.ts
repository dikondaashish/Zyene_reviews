import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    getGrowthDashboardAuthDiagnostics,
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
    const url = new URL(request.url);
    const cookieStore = await cookies();
    const token = cookieStore.get(growthDashboardCookieName())?.value;
    const cookieOk = verifyGrowthDashboardToken(token);
    const bearerOk = isAuthorizedGrowthDashboardRequest(request);

    if (!cookieOk && !bearerOk) {
        const diagnostics = getGrowthDashboardAuthDiagnostics(request);
        logger.info({ auth: diagnostics }, "[template-pack-report] unauthorized");

        const payload: { error: string; authDebug?: typeof diagnostics } = {
            error: "Unauthorized",
        };
        if (url.searchParams.get("auth_debug") === "1") {
            payload.authDebug = diagnostics;
        }
        return NextResponse.json(payload, { status: 401 });
    }

    const days = Math.min(90, Math.max(1, Number(url.searchParams.get("days") ?? "30") || 30));

    try {
        const report = await fetchTemplatePackLeadReport(days);
        return NextResponse.json(report);
    } catch (err) {
        logger.error({ err }, "[template-pack-report]");
        return NextResponse.json({ error: "Failed to load report" }, { status: 500 });
    }
}
