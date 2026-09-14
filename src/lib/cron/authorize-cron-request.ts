import { bearerMatches } from "@/lib/auth/constant-time-compare";
import { logger } from "@/lib/logger";

export type CronAuthorization = "authorized" | "unauthorized" | "misconfigured";

/**
 * Shared auth for GET /api/cron/* routes.
 * Requires `Authorization: Bearer <CRON_SECRET>` for Vercel and external schedulers.
 */
export function authorizeCronRequest(request: Request): CronAuthorization {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        logger.error("CRON_SECRET is not configured");
        return "misconfigured";
    }

    return bearerMatches(request.headers.get("authorization"), secret) ? "authorized" : "unauthorized";
}

export function isAuthorizedCronRequest(request: Request): boolean {
    return authorizeCronRequest(request) === "authorized";
}
