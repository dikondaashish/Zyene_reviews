import { NextResponse } from "next/server";
import {
    createGrowthDashboardToken,
    getGrowthDashboardSecret,
    growthDashboardCookieName,
    isAuthorizedGrowthDashboardPassword,
} from "@/lib/growth/growth-dashboard-auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/internal/growth-dashboard-auth
 * Body: { "password": string }
 * Sets HttpOnly cookie when password matches GROWTH_DASHBOARD_SECRET.
 */
export async function POST(request: Request) {
    const secret = getGrowthDashboardSecret();
    if (!secret) {
        return NextResponse.json(
            { error: "Growth dashboard is not configured (set GROWTH_DASHBOARD_SECRET)" },
            { status: 503 }
        );
    }

    let body: { password?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!isAuthorizedGrowthDashboardPassword(body.password)) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = createGrowthDashboardToken(secret);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(growthDashboardCookieName(), token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });
    return response;
}
