import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/db/supabase/admin";
import { authenticateApiKey, corsPreflight, withCors } from "@/app/api/v1/_lib/auth";

export async function OPTIONS() {
    return corsPreflight();
}

export async function GET(req: NextRequest) {
    const auth = await authenticateApiKey(req, "reviews:read");
    if (!auth.ok) return auth.response;

    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(sp.get("limit") || 20)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const status = sp.get("status"); // pending/responded/ignored
    const minRating = Number(sp.get("minRating") || 0);

    const admin = createAdminClient();
    let query = admin
        .from("reviews")
        .select(
            "id, author_name, rating, text, review_date, response_status, response_text, platform, is_visible",
            { count: "exact" }
        )
        .eq("business_id", auth.businessId)
        .eq("is_visible", true);

    if (status && ["pending", "responded", "ignored"].includes(status)) {
        query = query.eq("response_status", status);
    }
    if (Number.isFinite(minRating) && minRating >= 1 && minRating <= 5) {
        query = query.gte("rating", minRating);
    }

    const { data, count, error } = await query
        .order("review_date", { ascending: false })
        .range(from, to);

    if (error) {
        return withCors(NextResponse.json({ success: false, error: "Failed to fetch reviews." }, { status: 500 }));
    }

    return withCors(
        NextResponse.json({
            success: true,
            data: {
                page,
                limit,
                total: count || 0,
                reviews: data || [],
            },
        })
    );
}
