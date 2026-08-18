import { NextResponse, type NextRequest } from "next/server";

import { logger } from "@/lib/logger";
import { globalApiRateLimit } from "@/lib/auth/rate-limit";

import { originMatchesRequestHost } from "./proxy-cors";

/**
 * Login flows (OAuth redirect to /api/auth/callback) and the API burst right
 * after login share one IP; counting auth against the global bucket caused
 * false 429s for real users.
 */
const RATE_LIMIT_EXEMPT = ["/api/webhooks", "/api/inngest", "/api/cron", "/api/auth"];

/**
 * Developer API (v1) authenticates with X-API-Key / Bearer — Postman and
 * servers often omit Origin, so it is exempt from the Origin check.
 */
const CSRF_EXEMPT = ["/api/webhooks", "/api/inngest", "/api/cron", "/api/v1", "/api/aeo/crawler-logs"];

const MUTATING_METHODS = ["POST", "PUT", "DELETE", "PATCH"];

/**
 * Global API rate limiting (DDoS protection) plus CSRF Origin validation.
 * Returns a rejection response, or null to let the request continue.
 */
export async function handleApiGuards(
    request: NextRequest,
    pathname: string,
    hostHeader: string,
): Promise<NextResponse | null> {
    if (!RATE_LIMIT_EXEMPT.some((p) => pathname.startsWith(p))) {
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("x-real-ip") ||
            "anonymous";

        try {
            const { success } = await globalApiRateLimit.limit(ip);
            if (!success) {
                return NextResponse.json(
                    { error: "Too many requests. Please slow down." },
                    { status: 429 },
                );
            }
        } catch (e) {
            // If Redis is down, fail open (don't block legitimate traffic)
            logger.error({ err: e }, "Global rate limit check failed:");
        }
    }

    if (!CSRF_EXEMPT.some((p) => pathname.startsWith(p))) {
        const origin = request.headers.get("origin");
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
        const allowedOrigins = [
            `https://app.${rootDomain}`,
            `https://auth.${rootDomain}`,
            `https://${rootDomain}`,
            `https://www.${rootDomain}`,
        ];

        const csrfAllowed =
            allowedOrigins.includes(origin ?? "") || originMatchesRequestHost(origin, hostHeader);

        if (MUTATING_METHODS.includes(request.method) && !csrfAllowed) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
    }

    return null;
}
