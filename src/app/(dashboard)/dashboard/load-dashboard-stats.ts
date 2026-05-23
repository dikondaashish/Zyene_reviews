import { logger } from "@/lib/logger";
import type { ReactElement } from "react";
import type { VisibleReviewRollup } from "@/lib/reviews/visible-review-rollups";
import type { DashboardAuthContext } from "./load-dashboard-auth";
import { loadDashboardStatsFromCache } from "./load-dashboard-stats-cached";
import { applyDashboardStatsDemo } from "./load-dashboard-stats-demo";
import { runDashboardStatsQueries } from "./load-dashboard-stats-queries";
import { cacheDashboardStats } from "./load-dashboard-stats-cache-write";
import { processDashboardStatsQueryResults } from "./load-dashboard-stats-process";
import {
    createEmptyDashboardStatsState,
    type DashboardStatsState,
} from "./load-dashboard-stats-state";

export type LoadDashboardStatsResult = {
    stats: DashboardStatsState;
    visibleReviewRollup: VisibleReviewRollup | null;
    errorElement?: ReactElement;
};

export async function loadDashboardStats(
    auth: DashboardAuthContext,
): Promise<LoadDashboardStatsResult> {
    const stats = createEmptyDashboardStatsState();
    let visibleReviewRollup = auth.visibleReviewRollup;

    if (!auth.business.id) {
        return { stats, visibleReviewRollup };
    }

    const cacheKey = `dashboard:stats:${auth.business.id}`;
    let cachedStatsRaw: unknown = null;
    try {
        const { redis } = await import("@/lib/db/redis");
        cachedStatsRaw = await redis.get(cacheKey);
    } catch (e) {
        logger.error({ err: e }, "Redis fetch error:");
    }

    if (cachedStatsRaw) {
        const cached = await loadDashboardStatsFromCache(auth, stats, cachedStatsRaw);
        if (cached.errorElement) {
            return { stats: cached.stats, visibleReviewRollup, errorElement: cached.errorElement };
        }
    } else {
        const results = await runDashboardStatsQueries(auth);
        const processed = processDashboardStatsQueryResults(auth, stats, results);
        if (processed.errorElement) {
            return { stats: processed.stats, visibleReviewRollup, errorElement: processed.errorElement };
        }
        await cacheDashboardStats(auth.business.id, stats);
    }

    if (auth.useDemoData) {
        const demo = applyDashboardStatsDemo(stats, auth.business);
        visibleReviewRollup = demo.visibleReviewRollup;
    }

    return { stats, visibleReviewRollup };
}
