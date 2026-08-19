import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { NextResponse } from "next/server";
import Papa from "papaparse";
import { getAnalyticsPeriods } from "@/lib/analytics/date-range";
import { fetchAllReviewRowsPaginated } from "@/lib/reviews/fetch-reviews-paginated";
import { calculateReviewMetrics } from "@/lib/metrics/business-metrics";

export async function GET(request: Request) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";
    const platform = searchParams.get("platform") || "all";

    const { business } = await getActiveBusinessId();

    if (!business)
        return new NextResponse("No business found", { status: 403 });

    const { currentStart, currentEnd } = getAnalyticsPeriods(range);

    const fetchReviewsPage = (from: number, to: number) => {
        let q = supabase
            .from("reviews")
            .select("id,created_at,review_date,platform,rating,is_visible")
            .eq("business_id", business.id)
            .eq("is_visible", true)
            .gte("review_date", currentStart.toISOString())
            .lte("review_date", currentEnd.toISOString());

        if (platform === "zyene") {
            q = q.or("platform.eq.zyene,platform.is.null");
        } else if (platform !== "all") {
            q = q.eq("platform", platform);
        }

        return q
            .order("review_date", { ascending: true })
            .order("id", { ascending: true })
            .range(from, to);
    };

    const { data: reviews, error: reviewsError } =
        await fetchAllReviewRowsPaginated(1000, fetchReviewsPage);

    if (reviewsError) {
        return new NextResponse("Failed to load reviews for export", {
            status: 500,
        });
    }

    // Aggregate Daily Trends for the CSV
    const dateMap = new Map<string, Array<{ rating: number | null }>>();

    (reviews || []).forEach((r) => {
        const sourceDate = r.review_date || r.created_at;
        const date = new Date(sourceDate).toISOString().split("T")[0];
        const dayRows = dateMap.get(date) ?? [];
        dayRows.push(r);
        dateMap.set(date, dayRows);
    });

    const trendRows = Array.from(dateMap.entries()).map(([date, dayRows]) => {
        const metrics = calculateReviewMetrics(dayRows);
        return {
            Date: date,
            "Avg Rating": metrics.averageRating,
            "Review Count": metrics.totalReviews,
            "Positive (4-5 stars)": metrics.positiveReviews,
            "Neutral (3 stars)": metrics.neutralReviews,
            "Negative (1-2 stars)": metrics.negativeReviews,
        };
    });

    // Generate CSV
    const csvData = Papa.unparse(trendRows);
    const businessName = business.name || "business";
    const filename = `${businessName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_analytics_${platform}_${range}.csv`;

    return new NextResponse(csvData, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    });
}
