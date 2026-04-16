import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/db/supabase/admin";
import { authenticateApiKey, corsPreflight, withCors } from "@/app/api/v1/_lib/auth";

export async function OPTIONS() {
    return corsPreflight();
}

export async function GET(req: NextRequest) {
    const auth = await authenticateApiKey(req);
    if (!auth.ok) return auth.response;

    const days = Math.min(365, Math.max(1, Number(req.nextUrl.searchParams.get("days") || 30)));
    const start = new Date();
    start.setDate(start.getDate() - days);

    const admin = createAdminClient();
    const [reviewsRes, requestsRes] = await Promise.all([
        admin
            .from("reviews")
            .select("id, rating, response_status, review_date", { count: "exact" })
            .eq("business_id", auth.businessId)
            .gte("review_date", start.toISOString()),
        admin
            .from("review_requests")
            .select("id, status, sent_at, clicked_at, completed_at, review_left", { count: "exact" })
            .eq("business_id", auth.businessId)
            .gte("created_at", start.toISOString()),
    ]);

    if (reviewsRes.error || requestsRes.error) {
        return withCors(
            NextResponse.json({ success: false, error: "Failed to fetch analytics data." }, { status: 500 })
        );
    }

    const reviews = reviewsRes.data || [];
    const requests = requestsRes.data || [];
    const totalReviews = reviewsRes.count || 0;
    const avgRating =
        reviews.length > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0;
    const responded = reviews.filter((r) => r.response_status === "responded").length;
    const pending = reviews.filter((r) => r.response_status === "pending").length;
    const sent = requests.filter((r) => !!r.sent_at).length;
    const clicked = requests.filter((r) => !!r.clicked_at).length;
    const completed = requests.filter((r) => r.status === "completed" || r.status === "feedback_left").length;
    const reviewLeft = requests.filter((r) => r.review_left).length;

    return withCors(
        NextResponse.json({
            success: true,
            data: {
                rangeDays: days,
                reviews: {
                    total: totalReviews,
                    avgRating: Number(avgRating.toFixed(2)),
                    responded,
                    pending,
                    responseRate: totalReviews > 0 ? Number(((responded / totalReviews) * 100).toFixed(1)) : 0,
                },
                requests: {
                    total: requestsRes.count || 0,
                    sent,
                    clicked,
                    completed,
                    reviewLeft,
                    clickRate: sent > 0 ? Number(((clicked / sent) * 100).toFixed(1)) : 0,
                    completionRate: clicked > 0 ? Number(((completed / clicked) * 100).toFixed(1)) : 0,
                },
            },
        })
    );
}
