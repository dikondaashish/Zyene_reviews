import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { getGoogleSearchKeywords } from "@/services/google/performance-queries";
import { fetchAllReviewRowsPaginated } from "@/lib/reviews/fetch-reviews-paginated";
import { fromUntypedTable } from "@/lib/db/supabase/typed-table";

export async function fetchCompetitorsPageRaw(businessId: string, rangeStart: Date) {
    const supabase = await createClient();

    const [
        { data: competitors, error: competitorsError },
        { data: ownBusiness },
        snapshotsRes,
        eventsRes,
        insightsRes,
        latestRunRes,
        latestSuccessRunRes,
        latestFailedRunRes,
        recentAlertsCountRes,
        ownReviewsInRangeRes,
        latestSnapshotsForPlacesMetaRes,
        ownSearchKeywords,
        latestMarketBriefRes,
    ] = await Promise.all([
        supabase
            .from("competitors")
            .select("id, business_id, name, google_url, average_rating, total_reviews, created_at, updated_at")
            .eq("business_id", businessId)
            .order("created_at", { ascending: false }),
        supabase.from("businesses").select("id, name").eq("id", businessId).maybeSingle(),
        fromUntypedTable(supabase, "competitor_snapshots")
            .select("id, competitor_id, business_id, captured_at, average_rating, total_reviews, source, metadata")
            .eq("business_id", businessId)
            .gte("captured_at", rangeStart.toISOString())
            .order("captured_at", { ascending: false })
            .limit(1000),
        fromUntypedTable(supabase, "competitor_events")
            .select("id, competitor_id, business_id, event_type, title, summary, event_value, event_delta, created_at")
            .eq("business_id", businessId)
            .gte("created_at", rangeStart.toISOString())
            .order("created_at", { ascending: false })
            .limit(200),
        fromUntypedTable(supabase, "competitor_insights")
            .select(
                "id, competitor_id, business_id, range_key, summary, why_it_matters, owner_suggestion, actions, priority, confidence, recommendations, model, created_at"
            )
            .eq("business_id", businessId)
            .order("created_at", { ascending: false })
            .limit(100),
        fromUntypedTable(supabase, "competitor_watch_runs")
            .select(
                "id, run_id, business_id, status, scanned, external_updates, snapshots_created, events_created, insights_created, error_message, started_at, finished_at, created_at"
            )
            .eq("business_id", businessId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        fromUntypedTable(supabase, "competitor_watch_runs")
            .select(
                "id, run_id, business_id, status, scanned, external_updates, snapshots_created, events_created, insights_created, error_message, started_at, finished_at, created_at"
            )
            .eq("business_id", businessId)
            .eq("status", "success")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        fromUntypedTable(supabase, "competitor_watch_runs")
            .select(
                "id, run_id, business_id, status, scanned, external_updates, snapshots_created, events_created, insights_created, error_message, started_at, finished_at, created_at"
            )
            .eq("business_id", businessId)
            .eq("status", "failed")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        fromUntypedTable(supabase, "competitor_events")
            .select("id", { count: "exact", head: true })
            .eq("business_id", businessId)
            .gte("created_at", rangeStart.toISOString())
            .like("event_type", "competitor.alert.%"),
        fetchAllReviewRowsPaginated(1000, (from, to) =>
            supabase
                .from("reviews")
                .select("rating")
                .eq("business_id", businessId)
                .eq("is_visible", true)
                .gte("review_date", rangeStart.toISOString())
                .order("id", { ascending: true })
                .range(from, to)
        ),
        fromUntypedTable(supabase, "competitor_snapshots")
            .select("competitor_id, captured_at, metadata")
            .eq("business_id", businessId)
            .order("captured_at", { ascending: false })
            .limit(400),
        getGoogleSearchKeywords(supabase, businessId, 15),
        fromUntypedTable(supabase, "competitor_market_briefs")
            .select(
                "id, headline, overview, positioning_bullets, opportunity_actions, data_limitations, model, created_at"
            )
            .eq("business_id", businessId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
    ]);

    if (
        competitorsError ||
        snapshotsRes.error ||
        eventsRes.error ||
        insightsRes.error ||
        latestRunRes.error ||
        latestSuccessRunRes.error ||
        latestFailedRunRes.error ||
        recentAlertsCountRes.error ||
        ownReviewsInRangeRes.error ||
        latestSnapshotsForPlacesMetaRes.error ||
        latestMarketBriefRes.error
    ) {
        logger.error({ err: competitorsError }, "[Competitors page] Fetch failed:");
        return { ok: false as const };
    }

    return {
        ok: true as const,
        competitors,
        ownBusiness,
        snapshotsRes,
        eventsRes,
        insightsRes,
        latestRunRes,
        latestSuccessRunRes,
        latestFailedRunRes,
        recentAlertsCountRes,
        ownReviewsInRangeRes,
        latestSnapshotsForPlacesMetaRes,
        ownSearchKeywords,
        latestMarketBriefRes,
    };
}
