import { createAdminClient } from "@/lib/db/supabase/admin";
import { createClient } from "@/lib/db/supabase/server";
import { buildRequestsPageFilters } from "./requests-page-filters";

export async function loadRequestsPageStats(businessId: string, page: number, pageSize: number) {
    const filters = buildRequestsPageFilters();
    const admin = createAdminClient();
    const supabase = await createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const [
        totalSentRes,
        deliveredRes,
        clickedRes,
        reviewsRes,
        emailSentRes,
        smsSentRes,
        emailFailedRes,
        smsFailedRes,
        listRes,
    ] = await Promise.all([
        admin.from("review_requests").select("*", { count: "exact", head: true }).eq("business_id", businessId).or(filters.outboundAndSent),
        admin.from("review_requests").select("*", { count: "exact", head: true }).eq("business_id", businessId).or(filters.outboundAndDelivered),
        admin.from("review_requests").select("*", { count: "exact", head: true }).eq("business_id", businessId).or(filters.outboundAndClicked),
        admin.from("review_requests").select("*", { count: "exact", head: true }).eq("business_id", businessId).or(filters.outboundAndConverted),
        admin.from("review_requests").select("*", { count: "exact", head: true }).eq("business_id", businessId).or(filters.outboundAndEmailSent),
        admin.from("review_requests").select("*", { count: "exact", head: true }).eq("business_id", businessId).or(filters.outboundAndSmsSent),
        admin.from("review_requests").select("*", { count: "exact", head: true }).eq("business_id", businessId).or(filters.outboundAndEmailFailed),
        admin.from("review_requests").select("*", { count: "exact", head: true }).eq("business_id", businessId).or(filters.outboundAndSmsFailed),
        supabase
            .from("review_requests")
            .select("*")
            .eq("business_id", businessId)
            .or(filters.outboundRequestFilter)
            .order("created_at", { ascending: false })
            .range(from, to),
    ]);

    const error =
        totalSentRes.error ||
        deliveredRes.error ||
        clickedRes.error ||
        reviewsRes.error ||
        emailSentRes.error ||
        smsSentRes.error ||
        emailFailedRes.error ||
        smsFailedRes.error ||
        listRes.error;

    if (error) return { ok: false as const, error };

    const totalSent = totalSentRes.count ?? 0;
    const delivered = deliveredRes.count ?? 0;
    const clicked = clickedRes.count ?? 0;
    const reviews = reviewsRes.count ?? 0;
    const emailSent = emailSentRes.count || 0;
    const smsSent = smsSentRes.count || 0;
    const emailFailed = emailFailedRes.count || 0;
    const smsFailed = smsFailedRes.count || 0;
    const totalFailed = emailFailed + smsFailed;
    const safeTotal = totalSent || 0;
    const safeClicked = clicked || 0;

    return {
        ok: true as const,
        requests: (listRes.data ?? []) as Array<Record<string, unknown>>,
        stats: {
            totalSent,
            delivered,
            clicked,
            reviews,
            emailSent,
            smsSent,
            totalFailed,
            deliveryRate: safeTotal > 0 ? (delivered / safeTotal) * 100 : 0,
            clickRate: safeTotal > 0 ? (clicked / safeTotal) * 100 : 0,
            conversionRate: safeClicked > 0 ? (reviews / safeClicked) * 100 : 0,
        },
    };
}
