import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/db/supabase/admin";
import {
    authenticateApiKey,
    corsPreflight,
    withCors,
} from "@/app/api/v1/_lib/auth";
import { fetchAllReviewRowsPaginated } from "@/lib/reviews/fetch-reviews-paginated";
import {
    calculateRequestMetrics,
    calculateReviewMetrics,
} from "@/lib/metrics/business-metrics";
import { buildAnalyticsApiData } from "@/lib/metrics/analytics-api-response";

export async function OPTIONS() {
    return corsPreflight();
}

export async function GET(req: NextRequest) {
    const auth = await authenticateApiKey(req, "analytics:read");
    if (!auth.ok) return auth.response;

    const days = Math.min(
        365,
        Math.max(1, Number(req.nextUrl.searchParams.get("days") || 30)),
    );
    const start = new Date();
    start.setDate(start.getDate() - days);

    const admin = createAdminClient();
    const startIso = start.toISOString();

    const [reviewsPaged, requestsPaged] = await Promise.all([
        fetchAllReviewRowsPaginated(1000, (from, to) =>
            admin
                .from("reviews")
                .select(
                    "id, rating, response_status, responded_at, review_date",
                )
                .eq("business_id", auth.businessId)
                .eq("is_visible", true)
                .gte("review_date", startIso)
                .order("id", { ascending: true })
                .range(from, to),
        ),
        fetchAllReviewRowsPaginated(1000, (from, to) =>
            admin
                .from("review_requests")
                .select(
                    "id,status,channel,customer_phone,customer_email,customer_name,campaign_id,sent_at,delivered_at,clicked_at,completed_at,review_left,email_status,sms_status",
                )
                .eq("business_id", auth.businessId)
                .gte("created_at", startIso)
                .order("id", { ascending: true })
                .range(from, to),
        ),
    ]);

    if (reviewsPaged.error || requestsPaged.error) {
        return withCors(
            NextResponse.json(
                { success: false, error: "Failed to fetch analytics data." },
                { status: 500 },
            ),
        );
    }

    const reviews = reviewsPaged.data || [];
    const requests = requestsPaged.data || [];
    const reviewMetrics = calculateReviewMetrics(reviews);
    const requestMetrics = calculateRequestMetrics(requests);
    const reviewLeft = requests.filter((r) => r.review_left).length;
    const data = buildAnalyticsApiData(days, reviewMetrics, requestMetrics, reviewLeft);

    return withCors(
        NextResponse.json(
            { success: true, data },
            {
                headers: {
                    "Cache-Control":
                        "private, max-age=60, stale-while-revalidate=300",
                },
            },
        ),
    );
}
