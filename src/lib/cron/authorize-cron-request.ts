import { timingSafeEqual } from "node:crypto";

/**
 * Shared auth for GET /api/cron/* routes.
 * Requires `Authorization: Bearer <CRON_SECRET>` for Vercel and external schedulers.
 */
export function isAuthorizedCronRequest(request: Request): boolean {
    const authHeader = request.headers.get("authorization");
    const secret = process.env.CRON_SECRET;
    if (!authHeader || typeof secret !== "string" || secret.length === 0) return false;

    const actual = Buffer.from(authHeader);
    const expected = Buffer.from(`Bearer ${secret}`);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
}
