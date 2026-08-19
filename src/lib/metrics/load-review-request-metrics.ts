import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { fetchAllReviewRowsPaginated } from "@/lib/reviews/fetch-reviews-paginated";
import {
    calculateRequestMetrics,
    type RequestMetricRow,
    type RequestMetrics,
} from "@/lib/metrics/business-metrics";

export type ReviewRequestMetricRecord = RequestMetricRow & {
    id: string;
    created_at: string;
};

export type LoadReviewRequestMetricsResult =
    | { ok: true; rows: ReviewRequestMetricRecord[]; metrics: RequestMetrics }
    | { ok: false; error: { message: string } };

export async function loadReviewRequestMetrics(
    supabase: SupabaseClient<Database>,
    businessId: string,
    createdAfter?: Date,
): Promise<LoadReviewRequestMetricsResult> {
    const result = await fetchAllReviewRowsPaginated<ReviewRequestMetricRecord>(
        1000,
        (from, to) => {
            let query = supabase
                .from("review_requests")
                .select(
                    "id,created_at,status,channel,customer_phone,customer_email,customer_name,campaign_id,sent_at,delivered_at,clicked_at,completed_at,review_left,email_status,sms_status",
                )
                .eq("business_id", businessId);

            if (createdAfter) {
                query = query.gte("created_at", createdAfter.toISOString());
            }

            return query.order("id", { ascending: true }).range(from, to);
        },
    );

    if (result.error) {
        return { ok: false as const, error: result.error };
    }

    return {
        ok: true as const,
        rows: result.data,
        metrics: calculateRequestMetrics(result.data),
    };
}
