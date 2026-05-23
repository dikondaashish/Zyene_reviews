import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { NextResponse } from "next/server";
import Papa from "papaparse";
import {
    competitorRangeLabel,
    getCompetitorRangeStart,
    normalizeCompetitorRange,
} from "@/lib/competitors/date-range";
import { computeCompetitorMovementRows } from "@/lib/competitors/snapshot-movement";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { businessId, business } = await getActiveBusinessId();
    if (!businessId || !business) {
        return new NextResponse("No active business", { status: 403 });
    }

    const url = new URL(request.url);
    const range = normalizeCompetitorRange(url.searchParams.get("range") ?? undefined);
    const rangeStart = getCompetitorRangeStart(range);
    const periodLabel = competitorRangeLabel(range);

    const { data: competitors, error: competitorsError } = await supabase
        .from("competitors")
        .select("id, name, average_rating, total_reviews")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

    if (competitorsError || !competitors) {
        logger.error({ err: competitorsError }, "[competitors/export]");
        return new NextResponse("Failed to load competitors", { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
    const { data: snapshots, error: snapshotsError } = await (supabase
        .from("competitor_snapshots" as never) as any)
        .select("competitor_id, captured_at, average_rating, total_reviews")
        .eq("business_id", businessId)
        .gte("captured_at", rangeStart.toISOString())
        .order("captured_at", { ascending: false })
        .limit(2000);

    if (snapshotsError) {
        logger.error({ err: snapshotsError }, "[competitors/export] snapshots");
        return new NextResponse("Failed to load snapshots", { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
    const { data: events, error: eventsError } = await (supabase.from("competitor_events" as never) as any)
        .select("competitor_id")
        .eq("business_id", businessId)
        .gte("created_at", rangeStart.toISOString())
        .limit(5000);

    if (eventsError) {
        logger.error({ err: eventsError }, "[competitors/export] events");
        return new NextResponse("Failed to load events", { status: 500 });
    }

    const eventCounts = new Map<string, number>();
    for (const row of (events || []) as Array<{ competitor_id: string }>) {
        eventCounts.set(row.competitor_id, (eventCounts.get(row.competitor_id) ?? 0) + 1);
    }

    const movement = computeCompetitorMovementRows(
        competitors.map((c) => ({ id: c.id, name: c.name })),
        (snapshots || []) as Array<{
            competitor_id: string;
            captured_at: string;
            average_rating: number;
            total_reviews: number;
        }>
    );
    const movementById = new Map(movement.map((m) => [m.competitorId, m]));

    const formatted = competitors.map((c) => {
        const m = movementById.get(c.id);
        const ratingDelta = m?.ratingDelta;
        const reviewsDelta = m?.reviewsDelta;
        let trendNote = "no snapshots in period";
        if (m?.hasBaseline) {
            trendNote = "first vs last snapshot in period";
        } else if (ratingDelta !== null && reviewsDelta !== null) {
            trendNote = "single snapshot in period — add time for a second point to measure movement";
        }
        return {
            Period: periodLabel,
            "Period start (UTC)": rangeStart.toISOString(),
            "Competitor name": c.name,
            "Current avg rating": Number(c.average_rating ?? 0).toFixed(1),
            "Current total reviews": c.total_reviews ?? 0,
            "Rating delta in period":
                ratingDelta === null || ratingDelta === undefined ? "" : Number(ratingDelta.toFixed(2)),
            "Review delta in period": reviewsDelta === null || reviewsDelta === undefined ? "" : reviewsDelta,
            "Has multi-snapshot baseline": m?.hasBaseline ? "Yes" : "No",
            "Trend note": trendNote,
            "Events logged in period": eventCounts.get(c.id) ?? 0,
        };
    });

    const csvData = Papa.unparse(formatted);
    const safeName = (business.name || "business").replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const filename = `${safeName}_competitors_${range}.csv`;

    return new NextResponse(csvData, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    });
}
