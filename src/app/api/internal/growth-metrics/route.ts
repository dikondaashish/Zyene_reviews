import { NextResponse } from "next/server";
import {
    growthDashboardCookieName,
    isAuthorizedGrowthDashboardRequest,
    verifyGrowthDashboardToken,
} from "@/lib/growth/growth-dashboard-auth";
import { fetchGrowthKpiSnapshot } from "@/lib/growth/kpi-metrics";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
    if (isAuthorizedGrowthDashboardRequest(request)) return true;
    return false;
}

async function isAuthorizedViaCookie(): Promise<boolean> {
    const cookieStore = await cookies();
    const token = cookieStore.get(growthDashboardCookieName())?.value;
    return verifyGrowthDashboardToken(token);
}

/**
 * GET /api/internal/growth-metrics
 * Returns live KPI snapshot (Supabase + optional Stripe).
 * Auth: Bearer GROWTH_DASHBOARD_SECRET (or CRON_SECRET) or growth_dashboard cookie.
 */
export async function GET(request: Request) {
    const cookieOk = await isAuthorizedViaCookie();
    if (!cookieOk && !isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const days = Math.min(90, Math.max(7, Number(url.searchParams.get("days") ?? "30") || 30));

    try {
        const snapshot = await fetchGrowthKpiSnapshot(days);
        return NextResponse.json(snapshot);
    } catch (err) {
        console.error("[growth-metrics]", err);
        return NextResponse.json({ error: "Failed to load metrics" }, { status: 500 });
    }
}
