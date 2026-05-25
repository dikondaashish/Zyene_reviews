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

export type GrowthDashboardSecretSource = "GROWTH_DASHBOARD_SECRET" | "CRON_SECRET" | null;

export function growthDashboardSecretSource(): GrowthDashboardSecretSource {
    if (normalizeEnvSecret(process.env.GROWTH_DASHBOARD_SECRET)) {
        return "GROWTH_DASHBOARD_SECRET";
    }
    if (normalizeEnvSecret(process.env.CRON_SECRET)) {
        return "CRON_SECRET";
    }
    return null;
}

export function getGrowthDashboardSecret(): string | null {
    const dedicated = normalizeEnvSecret(process.env.GROWTH_DASHBOARD_SECRET);
    if (dedicated) return dedicated;
    return normalizeEnvSecret(process.env.CRON_SECRET);
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

export type GrowthDashboardAuthDiagnostics = {
    hasGrowthEnv: boolean;
    hasCronEnv: boolean;
    activeKey: GrowthDashboardSecretSource;
    authHeaderPresent: boolean;
    bearerPresent: boolean;
    bearerLength: number;
    secretLength: number;
    lengthMatch: boolean;
    tokenMatch: boolean;
};

export function getGrowthDashboardAuthDiagnostics(
    request: Request
): GrowthDashboardAuthDiagnostics {
    const secret = getGrowthDashboardSecret();
    const growth = normalizeEnvSecret(process.env.GROWTH_DASHBOARD_SECRET);
    const cron = normalizeEnvSecret(process.env.CRON_SECRET);
    const bearer = parseBearerToken(request.headers.get("authorization"));
    const lengthMatch =
        bearer !== null && secret !== null && bearer.length === secret.length;
    let tokenMatch = false;
    if (bearer) {
        tokenMatch =
            (growth !== null && secretsEqual(bearer, growth)) ||
            (cron !== null && secretsEqual(bearer, cron)) ||
            verifyGrowthDashboardToken(bearer);
    }

    return {
        hasGrowthEnv: normalizeEnvSecret(process.env.GROWTH_DASHBOARD_SECRET) !== null,
        hasCronEnv: normalizeEnvSecret(process.env.CRON_SECRET) !== null,
        activeKey: growthDashboardSecretSource(),
        authHeaderPresent: request.headers.get("authorization") !== null,
        bearerPresent: bearer !== null,
        bearerLength: bearer?.length ?? 0,
        secretLength: secret?.length ?? 0,
        lengthMatch,
        tokenMatch,
    };
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

export function isAuthorizedGrowthDashboardRequest(request: Request): boolean {
    const bearer = parseBearerToken(request.headers.get("authorization"));
    if (!bearer) return false;

    const growth = normalizeEnvSecret(process.env.GROWTH_DASHBOARD_SECRET);
    const cron = normalizeEnvSecret(process.env.CRON_SECRET);

    if (growth && secretsEqual(bearer, growth)) return true;
    if (cron && secretsEqual(bearer, cron)) return true;
    if (verifyGrowthDashboardToken(bearer)) return true;

    return false;
}

export function isAuthorizedGrowthDashboardPassword(password: string | undefined | null): boolean {
    const secret = getGrowthDashboardSecret();
    if (!secret || !password) return false;
    return secretsEqual(password.trim(), secret);
}
