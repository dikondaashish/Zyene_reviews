import { createAdminClient } from "@/lib/db/supabase/admin";
import { isOutboundRequest } from "@/lib/metrics/business-metrics";
import { loadReviewRequestMetrics } from "@/lib/metrics/load-review-request-metrics";
import { calculatePublicLinkMetrics, isPublicLinkVisit } from "@/lib/metrics/public-link-metrics";
import { attachRequestOutcomes } from "./load-request-outcomes";

/** "sent": requests sent to a customer. "link": visits to the public review link or QR code. */
export type RequestsView = "sent" | "link";

export async function loadRequestsPageStats(
    businessId: string,
    page: number,
    pageSize: number,
    view: RequestsView = "sent",
) {
    const admin = createAdminClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const metricsResult = await loadReviewRequestMetrics(admin, businessId);
    if (!metricsResult.ok)
        return { ok: false as const, error: metricsResult.error };
    const requests = metricsResult.rows
        .filter(view === "link" ? isPublicLinkVisit : isOutboundRequest)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(from, to + 1);

    return {
        ok: true as const,
        requests: (await attachRequestOutcomes(admin, businessId, requests)) as Array<Record<string, unknown>>,
        stats: {
            ...metricsResult.metrics,
            reviews: metricsResult.metrics.completed,
        },
        linkStats: calculatePublicLinkMetrics(metricsResult.rows),
    };
}
