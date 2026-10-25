import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { logger } from "@/lib/logger";
import { loadReviewRequestMetrics } from "@/lib/metrics/load-review-request-metrics";
import { REVIEW_RESPONSE_SOURCE_ZYENE, REVIEW_RESPONSE_SOURCE_ZYENE_AUTO } from "@/lib/reviews/response-source";
import { calculateValueSummary, type ValueSummary } from "@/lib/dashboard/value-summary";
import { calculateReviewValue, resolveAverageSale, type AverageSale, type ReviewValue } from "@/lib/dashboard/review-value";
import { loadMonthlyCharge } from "@/services/dashboard/load-monthly-charge";

export type ValueSummaryPeriod = { start: Date; previousStart: Date };

export type LoadedValueSummary = { summary: ValueSummary; averageSale: AverageSale; reviewValue: ReviewValue };

/** Calendar month so far (UTC), and the whole month before it for comparison. */
export function currentMonthPeriod(now = new Date()): ValueSummaryPeriod {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const previousStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    return { start, previousStart };
}

/** This month's results for one business, read with the caller's RLS client. Fails soft to null. */
export async function loadValueSummary(
    supabase: SupabaseClient<Database>,
    businessId: string,
    org: { id: string; plan?: string | null; plan_status?: string | null } | null,
    period: ValueSummaryPeriod = currentMonthPeriod(),
): Promise<LoadedValueSummary | null> {
    const start = period.start.toISOString();
    const previousStart = period.previousStart.toISOString();
    try {
        const [requests, newReviews, lastMonthReviews, replies, feedback, monthlyCharge, business] = await Promise.all([
            loadReviewRequestMetrics(supabase, businessId, period.start),
            supabase.from("reviews").select("id", { count: "exact", head: true })
                .eq("business_id", businessId).eq("is_visible", true).gte("review_date", start),
            supabase.from("reviews").select("id", { count: "exact", head: true })
                .eq("business_id", businessId).eq("is_visible", true)
                .gte("review_date", previousStart).lt("review_date", start),
            supabase.from("reviews").select("id", { count: "exact", head: true })
                .eq("business_id", businessId)
                .in("response_source", [REVIEW_RESPONSE_SOURCE_ZYENE, REVIEW_RESPONSE_SOURCE_ZYENE_AUTO])
                .gte("responded_at", start),
            supabase.from("private_feedback").select("id", { count: "exact", head: true })
                .eq("business_id", businessId).gte("created_at", start),
            org ? loadMonthlyCharge(org.id) : Promise.resolve(undefined),
            supabase.from("businesses").select("category, average_sale_cents").eq("id", businessId).maybeSingle(),
        ]);
        if (!requests.ok) throw requests.error;
        const failed = [newReviews, lastMonthReviews, replies, feedback, business].find((r) => r.error);
        if (failed?.error) throw failed.error;

        const summary = calculateValueSummary({
            requests: requests.rows,
            newReviews: newReviews.count ?? 0,
            newReviewsLastMonth: lastMonthReviews.count ?? 0,
            zyeneReplies: replies.count ?? 0,
            privateFeedback: feedback.count ?? 0,
            plan: org?.plan,
            planStatus: org?.plan_status,
            monthlyCharge,
        });
        const averageSale = resolveAverageSale(business.data?.average_sale_cents, business.data?.category);
        return {
            summary,
            averageSale,
            reviewValue: calculateReviewValue(summary.newReviews, averageSale, summary.monthlyPrice),
        };
    } catch (err) {
        logger.warn({ err, businessId }, "[dashboard] value summary load failed");
        return null;
    }
}
