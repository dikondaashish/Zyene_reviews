import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { buildAnalyticsRangePayload } from "@/lib/analytics/build-analytics-range-payload";

export async function GET(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { businessId, business } = await getActiveBusinessId();
    if (!businessId) return NextResponse.json({ error: "No active business" }, { status: 400 });

    const url = new URL(request.url);
    const rangeRaw = url.searchParams.get("range") ?? "30d";
    const platform = url.searchParams.get("platform") ?? "all";

    const result = await buildAnalyticsRangePayload(supabase, {
        businessId,
        business,
        rangeRaw,
        platform,
    });

    if ("error" in result) {
        return NextResponse.json({ error: "Failed to fetch analytics range data" }, { status: 500 });
    }

    return NextResponse.json(result, {
        headers: {
            "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
        },
    });
}
