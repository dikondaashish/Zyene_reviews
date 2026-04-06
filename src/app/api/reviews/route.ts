import { createClient } from "@/lib/db/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = await getActiveBusinessId();
    if (!businessId) {
        return NextResponse.json({ error: "No business found" }, { status: 404 });
    }

    const url = request.nextUrl;
    const type = url.searchParams.get("type") || "public";
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Always fetch both counts for tab labels
    const [{ count: publicCount }, { count: privateCount }] = await Promise.all([
        supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("business_id", businessId),
        supabase
            .from("private_feedback")
            .select("*", { count: "exact", head: true })
            .eq("business_id", businessId),
    ]);

    let reviews: unknown[] = [];
    let count = 0;

    if (type === "private") {
        const { data, count: totalCount } = await supabase
            .from("private_feedback")
            .select(`
                *,
                review_requests (
                    customer_name,
                    customer_email,
                    customer_phone
                )
            `, { count: "exact" })
            .eq("business_id", businessId)
            .order("created_at", { ascending: false })
            .range(from, to);

        reviews = data || [];
        count = totalCount || 0;
    } else {
        let query = supabase
            .from("reviews")
            .select("*", { count: "exact" })
            .eq("business_id", businessId);

        const statusRaw = url.searchParams.get("status") || "all";
        const statusMap: Record<string, string> = {
            "needs_response": "pending",
            "responded": "responded",
            "ignored": "ignored",
        };

        if (statusRaw !== "all" && statusMap[statusRaw]) {
            query = query.eq("response_status", statusMap[statusRaw]);
        }

        const rating = url.searchParams.get("rating");
        if (rating && rating !== "all") {
            query = query.eq("rating", parseInt(rating));
        }

        const sort = url.searchParams.get("sort") || "newest";
        if (sort === "newest") query = query.order("review_date", { ascending: false });
        else if (sort === "oldest") query = query.order("review_date", { ascending: true });
        else if (sort === "lowest") query = query.order("rating", { ascending: true });
        else if (sort === "highest") query = query.order("rating", { ascending: false });

        query = query.range(from, to);

        const { data, count: totalCount, error } = await query;
        if (error) {
            console.error("[Reviews API] Failed to load reviews:", error);
        }
        reviews = data || [];
        count = totalCount || 0;
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    return NextResponse.json({
        reviews,
        count,
        totalPages,
        page,
        publicCount: publicCount || 0,
        privateCount: privateCount || 0,
    });
}
