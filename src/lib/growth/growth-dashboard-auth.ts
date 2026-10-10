import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "growth_dashboard_token";
export const GROWTH_DASHBOARD_SESSION_SECONDS = 60 * 60 * 24 * 7;
const TOKEN_PATTERN = /^v2\.(\d{1,12})\.(\d{1,12})\.([a-f0-9]{32})\.([a-f0-9]{64})$/;

function signSession(payload: string, secret: string): string {
    return createHmac("sha256", secret).update(`zyene-growth-dashboard:${payload}`).digest("hex");
}

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
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + GROWTH_DASHBOARD_SESSION_SECONDS;
    const payload = `v2.${issuedAt}.${expiresAt}.${randomBytes(16).toString("hex")}`;
    return `${payload}.${signSession(payload, secret)}`;
}

export function verifyGrowthDashboardToken(token: string | undefined | null): boolean {
    const secret = getGrowthDashboardSecret();
    if (!secret || !token || token.length > 256) return false;
    const normalized = token.trim();
    const match = TOKEN_PATTERN.exec(normalized);
    if (!match) return false;
    const issuedAt = Number(match[1]);
    const expiresAt = Number(match[2]);
    const now = Math.floor(Date.now() / 1000);
    if (issuedAt > now || expiresAt <= now || expiresAt - issuedAt !== GROWTH_DASHBOARD_SESSION_SECONDS)
        return false;
    const payload = normalized.slice(0, normalized.lastIndexOf("."));
    return secretsEqual(match[4], signSession(payload, secret));
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
