import { fetchAllReviewRowsPaginated } from "@/lib/reviews/fetch-reviews-paginated";
import type { DashboardAuthContext } from "./load-dashboard-auth";

export async function runDashboardStatsQueries(auth: DashboardAuthContext) {
    const { supabase, user, business } = auth;
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return Promise.all([
        supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .eq("is_visible", true)
            .eq("response_status", "responded"),
        supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .eq("is_visible", true)
            .eq("response_status", "pending"),
        supabase
            .from("reviews")
            .select("*")
            .eq("business_id", business.id)
            .eq("is_visible", true)
            .order("review_date", { ascending: false })
            .limit(15),
        supabase
            .from("reviews")
            .select("*")
            .eq("business_id", business.id)
            .eq("is_visible", true)
            .eq("response_status", "pending")
            .or("rating.lte.2,urgency_score.gte.7")
            .order("urgency_score", { ascending: false, nullsFirst: false })
            .limit(5),
        fetchAllReviewRowsPaginated(1000, (from, to) =>
            supabase
                .from("reviews")
                .select("review_date, rating")
                .eq("business_id", business.id)
                .eq("is_visible", true)
                .gte("review_date", startOfLastYear.toISOString())
                .order("review_date", { ascending: true })
                .order("id", { ascending: true })
                .range(from, to),
        ),
        fetchAllReviewRowsPaginated(1000, (from, to) =>
            supabase
                .from("reviews")
                .select("review_date")
                .eq("business_id", business.id)
                .eq("is_visible", true)
                .gte("review_date", thirtyDaysAgo.toISOString())
                .order("review_date", { ascending: true })
                .order("id", { ascending: true })
                .range(from, to),
        ),
        fetchAllReviewRowsPaginated(1000, (from, to) =>
            supabase
                .from("reviews")
                .select("rating")
                .eq("business_id", business.id)
                .eq("is_visible", true)
                .order("id", { ascending: true })
                .range(from, to),
        ),
        supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .eq("is_visible", true)
            .eq("sentiment", "positive"),
        supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .eq("is_visible", true)
            .in("sentiment", ["negative", "mixed"]),
        supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .eq("is_visible", true)
            .not("sentiment", "is", null),
        supabase
            .from("review_requests")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .in("status", ["completed", "feedback_left"]),
        supabase
            .from("review_requests")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .not("status", "eq", "queued"),
        supabase
            .from("review_requests")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .gte("created_at", startOfThisMonth.toISOString()),
        supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .eq("is_visible", true)
            .gte("review_date", thirtyDaysAgo.toISOString()),
        supabase
            .from("customers")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id),
        supabase
            .from("notification_preferences")
            .select("*")
            .eq("business_id", business.id)
            .eq("user_id", user.id)
            .limit(1),
    ] as const);
}

export type DashboardStatsQueryResults = Awaited<ReturnType<typeof runDashboardStatsQueries>>;
