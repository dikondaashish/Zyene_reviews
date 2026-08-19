import { createAdminClient } from "@/lib/db/supabase/admin";
import { isOutboundRequest } from "@/lib/metrics/business-metrics";
import { loadReviewRequestMetrics } from "@/lib/metrics/load-review-request-metrics";

export async function loadRequestsPageStats(
    businessId: string,
    page: number,
    pageSize: number,
) {
    const admin = createAdminClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const metricsResult = await loadReviewRequestMetrics(admin, businessId);
    if (!metricsResult.ok)
        return { ok: false as const, error: metricsResult.error };
    const requests = metricsResult.rows
        .filter(isOutboundRequest)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(from, to + 1);

    return {
        ok: true as const,
        requests: requests as Array<Record<string, unknown>>,
        stats: {
            ...metricsResult.metrics,
            reviews: metricsResult.metrics.completed,
        },
    };
}
