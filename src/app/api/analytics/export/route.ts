import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { NextResponse } from "next/server";
import Papa from "papaparse";
import { getAnalyticsPeriods } from "@/lib/analytics/date-range";

export async function GET(request: Request) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

    const { business } = await getActiveBusinessId();

    if (!business) return new NextResponse("No business found", { status: 403 });

    const { currentStart, currentEnd } = getAnalyticsPeriods(range);

    // Fetch Reviews for Export
    const { data: reviews } = await supabase
        .from("reviews")
        .select("*")
        .eq("business_id", business.id)
        .gte("created_at", currentStart.toISOString())
        .lte("created_at", currentEnd.toISOString())
        .order("created_at", { ascending: true });

    // Aggregate Daily Trends for the CSV
    const dateMap = new Map<string, { Date: string; "Avg Rating": number; "Review Count": number; "Positive": number; "Neutral": number; "Negative": number }>();

    (reviews || []).forEach((r) => {
        const date = new Date(r.created_at).toISOString().split('T')[0];
        if (!dateMap.has(date)) {
            dateMap.set(date, { Date: date, "Avg Rating": 0, "Review Count": 0, Positive: 0, Neutral: 0, Negative: 0 });
        }
        const entry = dateMap.get(date)!;
        entry["Avg Rating"] = (entry["Avg Rating"] * entry["Review Count"] + (r.rating || 0)) / (entry["Review Count"] + 1);
        entry["Review Count"] += 1;

        const rating = r.rating || 0;
        if (rating >= 4) entry.Positive++;
        else if (rating === 3) entry.Neutral++;
        else entry.Negative++;
    });

    const trendRows = Array.from(dateMap.values());

    // Generate CSV
    const csvData = Papa.unparse(trendRows);
    const businessName = business.name || "business";
    const filename = `${businessName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analytics_${range}.csv`;

    return new NextResponse(csvData, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`
        }
    });
}
