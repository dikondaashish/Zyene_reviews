/**
 * Dashboard aggregates (needs-attention list, pending counts, etc.) are cached in Redis.
 * Call this after any mutation that changes review response state or similar stats.
 */
export async function invalidateDashboardStatsCache(businessId: string | null | undefined): Promise<void> {
    if (!businessId) return;
    const key = `dashboard:stats:${businessId}`;
    try {
        const { redis } = await import("@/lib/db/redis");
        await redis.del(key);
    } catch (e) {
        console.error("[invalidateDashboardStatsCache]", key, e);
    }
}
