import { logger } from "@/lib/logger";

/** v3: the attention list now holds only unanswered 1-2 star reviews. */
export function dashboardStatsCacheKey(businessId: string): string {
    return `dashboard:stats:v3:${businessId}`;
}
/**
 * Dashboard aggregates (needs-attention list, pending counts, etc.) are cached in Redis.
 * Call this after any mutation that changes review response state or similar stats.
 */
export async function invalidateDashboardStatsCache(businessId: string | null | undefined): Promise<void> {
    if (!businessId) return;
    // Must match the key load-dashboard-stats reads; the old unversioned key is cleared too.
    const keys = [dashboardStatsCacheKey(businessId), `dashboard:stats:${businessId}`];
    try {
        const { redis } = await import("@/lib/db/redis");
        await redis.del(...keys);
    } catch (e) {
        logger.error({ err: keys, e }, "[invalidateDashboardStatsCache]");
    }
}
