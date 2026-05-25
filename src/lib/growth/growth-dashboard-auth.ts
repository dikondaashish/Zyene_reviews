import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "growth_dashboard_token";
const TOKEN_PAYLOAD = "zyene-growth-dashboard-v1";

function normalizeEnvSecret(raw: string | undefined): string | null {
    if (raw == null) return null;
    let value = raw.trim();
    if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
    ) {
        value = value.slice(1, -1).trim();
    }
    return value.length > 0 ? value : null;
}

export function getGrowthDashboardSecret(): string | null {
    return normalizeEnvSecret(process.env.GROWTH_DASHBOARD_SECRET);
}

export function growthDashboardCookieName(): string {
    return COOKIE_NAME;
}

function parseBearerToken(authHeader: string | null): string | null {
    if (!authHeader) return null;
    const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
    return match ? match[1].trim() : null;
}

function secretsEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) return false;
    try {
        return timingSafeEqual(bufA, bufB);
    } catch {
        return false;
    }
}

export function createGrowthDashboardToken(secret: string): string {
    return createHmac("sha256", secret).update(TOKEN_PAYLOAD).digest("hex");
}

export function verifyGrowthDashboardToken(token: string | undefined | null): boolean {
    const secret = getGrowthDashboardSecret();
    if (!secret || !token) return false;
    const expected = createGrowthDashboardToken(secret);
    return secretsEqual(token.trim(), expected);
}

/** Bearer must match GROWTH_DASHBOARD_SECRET or a valid dashboard session cookie token. */
export function isAuthorizedGrowthDashboardRequest(request: Request): boolean {
    const growth = getGrowthDashboardSecret();
    if (!growth) return false;

    const bearer = parseBearerToken(request.headers.get("authorization"));
    if (!bearer) return false;

    if (secretsEqual(bearer, growth)) return true;
    if (verifyGrowthDashboardToken(bearer)) return true;

    return false;
}

export function isAuthorizedGrowthDashboardPassword(password: string | undefined | null): boolean {
    const secret = getGrowthDashboardSecret();
    if (!secret || !password) return false;
    return secretsEqual(password.trim(), secret);
}
