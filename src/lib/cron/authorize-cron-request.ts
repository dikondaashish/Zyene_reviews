/**
 * Shared auth for GET /api/cron/* routes.
 * Accepts `Authorization: Bearer <CRON_SECRET>` or Vercel Cron (`x-vercel-cron: 1`).
 */
export function isAuthorizedCronRequest(request: Request): boolean {
    const authHeader = request.headers.get("authorization");
    const hasSecret = typeof process.env.CRON_SECRET === "string" && process.env.CRON_SECRET.length > 0;
    const hasValidBearer = hasSecret && authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isVercelCron = request.headers.get("x-vercel-cron") === "1";
    return Boolean(hasValidBearer || isVercelCron);
}
