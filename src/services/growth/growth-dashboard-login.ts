import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import {
    createGrowthDashboardToken,
    getGrowthDashboardSecret,
    GROWTH_DASHBOARD_SESSION_SECONDS,
    growthDashboardCookieName,
    isAuthorizedGrowthDashboardPassword,
} from "@/lib/growth/growth-dashboard-auth";

const loginSchema = z.strictObject({ password: z.string().max(2048).trim().min(1) });

export async function handleGrowthDashboardLogin(request: Request) {
    const secret = getGrowthDashboardSecret();
    if (!secret) {
        return NextResponse.json({ error: "Growth dashboard is not configured" }, { status: 503 });
    }

    try {
        const parsed = loginSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid login payload" }, { status: 400 });
        }
        if (!isAuthorizedGrowthDashboardPassword(parsed.data.password)) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        const response = NextResponse.json({ ok: true });
        response.cookies.set(growthDashboardCookieName(), createGrowthDashboardToken(secret), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: GROWTH_DASHBOARD_SESSION_SECONDS,
        });
        response.headers.set("Cache-Control", "no-store");
        return response;
    } catch (error) {
        logger.error({ err: error }, "[growth-dashboard-login] Session creation failed");
        return NextResponse.json({ error: "Unable to sign in" }, { status: 500 });
    }
}
