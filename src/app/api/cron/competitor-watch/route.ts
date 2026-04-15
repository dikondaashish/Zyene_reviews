import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { pingCompetitorWatchHeartbeat } from "@/lib/monitoring/competitor-watch-heartbeat";

export const dynamic = "force-dynamic";

function isAuthorizedCronRequest(request: Request): boolean {
    const authHeader = request.headers.get("authorization");
    const hasSecret = typeof process.env.CRON_SECRET === "string" && process.env.CRON_SECRET.length > 0;
    return Boolean(hasSecret && authHeader === `Bearer ${process.env.CRON_SECRET}`);
}

function sameUtcDay(aIso: string | null | undefined, b: Date): boolean {
    if (!aIso) return false;
    const a = new Date(aIso);
    return (
        a.getUTCFullYear() === b.getUTCFullYear() &&
        a.getUTCMonth() === b.getUTCMonth() &&
        a.getUTCDate() === b.getUTCDate()
    );
}

export async function GET(request: Request) {
    if (!isAuthorizedCronRequest(request)) {
        await pingCompetitorWatchHeartbeat(false);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const now = new Date();

    try {
        const { data: competitors, error: competitorsErr } = await admin
            .from("competitors")
            .select("id, business_id, name, average_rating, total_reviews")
            .order("created_at", { ascending: false });

        if (competitorsErr) {
            console.error("[cron/competitor-watch] competitors fetch failed:", competitorsErr);
            await pingCompetitorWatchHeartbeat(false);
            return NextResponse.json({ error: competitorsErr.message }, { status: 500 });
        }

        if (!competitors || competitors.length === 0) {
            await pingCompetitorWatchHeartbeat(true);
            return NextResponse.json({
                success: true,
                scanned: 0,
                snapshotsCreated: 0,
                eventsCreated: 0,
                message: "No competitors to process",
            });
        }

        const competitorIds = competitors.map((c) => c.id);
        const { data: existingSnapshots, error: snapshotsErr } = await (admin
            .from("competitor_snapshots" as never) as any)
            .select("id, competitor_id, captured_at, average_rating, total_reviews")
            .in("competitor_id", competitorIds)
            .order("captured_at", { ascending: false });

        if (snapshotsErr) {
            console.error("[cron/competitor-watch] snapshots fetch failed:", snapshotsErr);
            await pingCompetitorWatchHeartbeat(false);
            return NextResponse.json({ error: snapshotsErr.message }, { status: 500 });
        }

        const latestByCompetitor = new Map<
            string,
            { id: string; competitor_id: string; captured_at: string; average_rating: number; total_reviews: number }
        >();
        for (const row of (existingSnapshots || []) as Array<{
            id: string;
            competitor_id: string;
            captured_at: string;
            average_rating: number;
            total_reviews: number;
        }>) {
            if (!latestByCompetitor.has(row.competitor_id)) {
                latestByCompetitor.set(row.competitor_id, row);
            }
        }

        const snapshotsToInsert: Array<{
            competitor_id: string;
            business_id: string;
            captured_at: string;
            average_rating: number;
            total_reviews: number;
            source: string;
            metadata: Record<string, unknown>;
        }> = [];
        const eventsToInsert: Array<{
            competitor_id: string;
            business_id: string;
            event_type: string;
            title: string;
            summary: string;
            event_value: number;
            event_delta: number;
            metadata: Record<string, unknown>;
            created_at: string;
        }> = [];

        for (const competitor of competitors) {
            const latest = latestByCompetitor.get(competitor.id);
            const currRating = Number(competitor.average_rating || 0);
            const currReviews = Number(competitor.total_reviews || 0);
            const prevRating = Number(latest?.average_rating || 0);
            const prevReviews = Number(latest?.total_reviews || 0);
            const ratingDelta = Number((currRating - prevRating).toFixed(1));
            const reviewsDelta = currReviews - prevReviews;

            const sameDay = latest ? sameUtcDay(latest.captured_at, now) : false;
            const unchanged = latest ? ratingDelta === 0 && reviewsDelta === 0 : false;
            if (sameDay && unchanged) {
                continue;
            }

            snapshotsToInsert.push({
                competitor_id: competitor.id,
                business_id: competitor.business_id,
                captured_at: now.toISOString(),
                average_rating: currRating,
                total_reviews: currReviews,
                source: "cron",
                metadata: {
                    previous_rating: prevRating,
                    previous_reviews: prevReviews,
                    rating_delta: ratingDelta,
                    reviews_delta: reviewsDelta,
                },
            });

            if (latest && ratingDelta !== 0) {
                eventsToInsert.push({
                    competitor_id: competitor.id,
                    business_id: competitor.business_id,
                    event_type: "competitor.rating_changed",
                    title: `${competitor.name} rating changed`,
                    summary: `${competitor.name} rating moved by ${ratingDelta > 0 ? "+" : ""}${ratingDelta} to ${currRating.toFixed(1)}.`,
                    event_value: currRating,
                    event_delta: ratingDelta,
                    metadata: { previous_rating: prevRating, current_rating: currRating },
                    created_at: now.toISOString(),
                });
            }

            if (latest && reviewsDelta !== 0) {
                eventsToInsert.push({
                    competitor_id: competitor.id,
                    business_id: competitor.business_id,
                    event_type: "competitor.review_count_changed",
                    title: `${competitor.name} review volume changed`,
                    summary: `${competitor.name} review count changed by ${reviewsDelta > 0 ? "+" : ""}${reviewsDelta} to ${currReviews}.`,
                    event_value: currReviews,
                    event_delta: reviewsDelta,
                    metadata: { previous_reviews: prevReviews, current_reviews: currReviews },
                    created_at: now.toISOString(),
                });
            }
        }

        if (snapshotsToInsert.length > 0) {
            const { error: insertSnapshotsErr } = await (admin.from("competitor_snapshots" as never) as any).insert(
                snapshotsToInsert
            );
            if (insertSnapshotsErr) {
                console.error("[cron/competitor-watch] snapshots insert failed:", insertSnapshotsErr);
                await pingCompetitorWatchHeartbeat(false);
                return NextResponse.json({ error: insertSnapshotsErr.message }, { status: 500 });
            }
        }

        if (eventsToInsert.length > 0) {
            const { error: insertEventsErr } = await (admin.from("competitor_events" as never) as any).insert(
                eventsToInsert
            );
            if (insertEventsErr) {
                console.error("[cron/competitor-watch] events insert failed:", insertEventsErr);
                await pingCompetitorWatchHeartbeat(false);
                return NextResponse.json({ error: insertEventsErr.message }, { status: 500 });
            }
        }

        await pingCompetitorWatchHeartbeat(true);

        return NextResponse.json({
            success: true,
            scanned: competitors.length,
            snapshotsCreated: snapshotsToInsert.length,
            eventsCreated: eventsToInsert.length,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal server error";
        console.error("[cron/competitor-watch] unexpected error:", error);
        await pingCompetitorWatchHeartbeat(false);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
