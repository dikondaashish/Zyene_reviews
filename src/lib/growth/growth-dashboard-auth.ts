import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "growth_dashboard_token";
const TOKEN_PAYLOAD = "zyene-growth-dashboard-v1";

export function getGrowthDashboardSecret(): string | null {
    const dedicated = process.env.GROWTH_DASHBOARD_SECRET?.trim();
    if (dedicated) return dedicated;
    const cron = process.env.CRON_SECRET?.trim();
    return cron || null;
}

export function growthDashboardCookieName(): string {
    return COOKIE_NAME;
}

export function createGrowthDashboardToken(secret: string): string {
    return createHmac("sha256", secret).update(TOKEN_PAYLOAD).digest("hex");
}

export function verifyGrowthDashboardToken(token: string | undefined | null): boolean {
    const secret = getGrowthDashboardSecret();
    if (!secret || !token) return false;
    const expected = createGrowthDashboardToken(secret);
    try {
        const a = Buffer.from(token, "utf8");
        const b = Buffer.from(expected, "utf8");
        if (a.length !== b.length) return false;
        return timingSafeEqual(a, b);
    } catch {
        return false;
    }
}

export function isAuthorizedGrowthDashboardRequest(request: Request): boolean {
    const secret = getGrowthDashboardSecret();
    if (!secret) return false;
    const authHeader = request.headers.get("authorization");
    if (authHeader === `Bearer ${secret}`) return true;
    return false;
}
