import { bearerMatches } from "@/lib/auth/constant-time-compare";

/**
 * Shared auth for GET /api/cron/* routes.
 * Requires `Authorization: Bearer <CRON_SECRET>` for Vercel and external schedulers.
 */
export function isAuthorizedCronRequest(request: Request): boolean {
    return bearerMatches(request.headers.get("authorization"), process.env.CRON_SECRET);
}
