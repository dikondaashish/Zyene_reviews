import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { CompetitorsList, type CompetitorWatchBenchmarkRange } from "./competitors-list";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { TrendingUp } from "lucide-react";
import {
    marketAverageEndRating,
    averageRatingFromReviewRatings,
    hasSyncedCompetitorMetrics,
} from "@/lib/competitors/range-benchmark";
import {
    competitorRangeLabel,
    getCompetitorRangeStart,
    normalizeCompetitorRange,
} from "@/lib/competitors/date-range";
import {
    parsePlacesMetaFromSnapshot,
    type CompetitorPlacesRowMeta,
} from "@/lib/competitors/places-snapshot-meta";
import { estimateDiscoverySplit, getGoogleSearchKeywords } from "@/services/google/performance-queries";
import { fetchVisibleReviewRollupsByBusinessIds } from "@/lib/reviews/visible-review-rollups";
import { fetchAllReviewRowsPaginated } from "@/lib/reviews/fetch-reviews-paginated";

export const metadata = {
    title: "Competitors - Zyene Reviews",
    description: "Monitor your competitors' ratings and performance.",
};

export default async function CompetitorsPage({
    searchParams,
}: {
    searchParams: Promise<{ range?: string }>;
}) {
    const supabase = await createClient();
    const sp = await searchParams;
    const range = normalizeCompetitorRange(sp.range);
    const rangeStart = getCompetitorRangeStart(range);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get active business from context
    const { businessId } = await getActiveBusinessId();

    if (!businessId) {
        return (
            <BusinessContextEmptyState
                icon={TrendingUp}
                title="Add a business to track competitors"
                description="Competitor monitoring is scoped to your active business. Add a location or switch business in the header to continue."
            />
        );
    }

    // Fetch competitors
    const { data: competitors, error: competitorsError } = await supabase
        .from("competitors")
        .select("id, business_id, name, google_url, average_rating, total_reviews, created_at, updated_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

    const { data: ownBusiness } = await supabase
        .from("businesses")
        .select("id, name")
        .eq("id", businessId)
        .maybeSingle();

    const snapshotsPromise = (supabase
        .from("competitor_snapshots" as never) as any)
        .select("id, competitor_id, business_id, captured_at, average_rating, total_reviews, source, metadata")
        .eq("business_id", businessId)
        .gte("captured_at", rangeStart.toISOString())
        .order("captured_at", { ascending: false })
        .limit(1000);

    const eventsPromise = (supabase
        .from("competitor_events" as never) as any)
        .select("id, competitor_id, business_id, event_type, title, summary, event_value, event_delta, created_at")
        .eq("business_id", businessId)
        .gte("created_at", rangeStart.toISOString())
        .order("created_at", { ascending: false })
        .limit(200);

    const insightsPromise = (supabase
        .from("competitor_insights" as never) as any)
        .select("id, competitor_id, business_id, range_key, summary, why_it_matters, owner_suggestion, actions, priority, confidence, recommendations, model, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(100);

    const latestRunPromise = (supabase
        .from("competitor_watch_runs" as never) as any)
        .select(
            "id, run_id, business_id, status, scanned, external_updates, snapshots_created, events_created, insights_created, error_message, started_at, finished_at, created_at"
        )
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    const latestSuccessRunPromise = (supabase
        .from("competitor_watch_runs" as never) as any)
        .select(
            "id, run_id, business_id, status, scanned, external_updates, snapshots_created, events_created, insights_created, error_message, started_at, finished_at, created_at"
        )
        .eq("business_id", businessId)
        .eq("status", "success")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    const latestFailedRunPromise = (supabase
        .from("competitor_watch_runs" as never) as any)
        .select(
            "id, run_id, business_id, status, scanned, external_updates, snapshots_created, events_created, insights_created, error_message, started_at, finished_at, created_at"
        )
        .eq("business_id", businessId)
        .eq("status", "failed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    const recentAlertsCountPromise = (supabase.from("competitor_events" as never) as any)
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .gte("created_at", rangeStart.toISOString())
        .like("event_type", "competitor.alert.%");

    const ownReviewsInRangePromise = fetchAllReviewRowsPaginated(1000, (from, to) =>
        supabase
            .from("reviews")
            .select("rating")
            .eq("business_id", businessId)
            .eq("is_visible", true)
            .gte("review_date", rangeStart.toISOString())
            .order("id", { ascending: true })
            .range(from, to)
    );

    const latestSnapshotsForPlacesMetaPromise = (supabase
        .from("competitor_snapshots" as never) as any)
        .select("competitor_id, captured_at, metadata")
        .eq("business_id", businessId)
        .order("captured_at", { ascending: false })
        .limit(400);

    const latestMarketBriefPromise = (supabase.from("competitor_market_briefs" as never) as any)
        .select(
            "id, headline, overview, positioning_bullets, opportunity_actions, data_limitations, model, created_at"
        )
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    const [
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
        snapshotsPromise,
        eventsPromise,
        insightsPromise,
        latestRunPromise,
        latestSuccessRunPromise,
        latestFailedRunPromise,
        recentAlertsCountPromise,
        ownReviewsInRangePromise,
        latestSnapshotsForPlacesMetaPromise,
        getGoogleSearchKeywords(supabase, businessId, 15),
        latestMarketBriefPromise,
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
        console.error("[Competitors page] Fetch failed:", competitorsError);
        return (
            <div className="flex-1 space-y-6 p-4 pt-4 sm:p-6 sm:pt-5 lg:p-8 lg:pt-6">
                <DashboardFetchError
                    message="We could not load competitors. Check your connection and try again."
                    retryHref="/competitors"
                />
            </div>
        );
    }

    const visibleRollupMap = await fetchVisibleReviewRollupsByBusinessIds(supabase, [businessId]);
    const visibleRollupAll = visibleRollupMap.get(businessId)!;

    const snapshotRowsTyped = (snapshotsRes.data || []) as Array<{
        id: string;
        competitor_id: string;
        business_id: string;
        captured_at: string;
        average_rating: number;
        total_reviews: number;
        source: string;
        metadata: Record<string, unknown> | null;
    }>;
    const competitorsList = competitors || [];
    const ownRatings = (ownReviewsInRangeRes.data || []).map((r: { rating: number }) => Number(r.rating));
    const ownAvgInRange = averageRatingFromReviewRatings(ownRatings);
    const { avgEnd: marketEndAvgRating, usedFallback: marketEndUsedFallback } = marketAverageEndRating(
        competitorsList.map((c) => ({
            id: c.id,
            average_rating: c.average_rating,
            total_reviews: c.total_reviews,
        })),
        snapshotRowsTyped.map((s) => ({
            competitor_id: s.competitor_id,
            captured_at: s.captured_at,
            average_rating: s.average_rating,
            total_reviews: s.total_reviews,
            source: s.source,
        }))
    );

    const marketBenchmarkAvailable =
        competitorsList.length === 0 ||
        hasSyncedCompetitorMetrics(
            competitorsList.map((c) => ({
                id: c.id,
                average_rating: c.average_rating,
                total_reviews: c.total_reviews,
            })),
            snapshotRowsTyped.map((s) => ({
                competitor_id: s.competitor_id,
                captured_at: s.captured_at,
                average_rating: s.average_rating,
                total_reviews: s.total_reviews,
                source: s.source,
            }))
        );

    const yourRatingForRank =
        ownAvgInRange !== null
            ? ownAvgInRange
            : visibleRollupAll.totalVisible > 0
              ? visibleRollupAll.averageRatingVisible
              : 0;
    const competitorEndRatings = competitorsList.map((c) => {
        const rows = snapshotRowsTyped
            .filter((s) => s.competitor_id === c.id)
            .sort((a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime());
        const last = rows[rows.length - 1];
        return last ? Number(last.average_rating || 0) : Number(c.average_rating || 0);
    });
    const combinedForRank = [yourRatingForRank, ...competitorEndRatings];
    const sortedForRank = combinedForRank.slice().sort((a, b) => b - a);
    const rankInRange =
        !marketBenchmarkAvailable && competitorsList.length > 0
            ? null
            : sortedForRank.length > 0
              ? sortedForRank.findIndex((v) => Math.abs(v - yourRatingForRank) < 0.001) + 1
              : null;

    const benchmarkRangePayload: CompetitorWatchBenchmarkRange = {
        label: competitorRangeLabel(range),
        marketEndAvgRating,
        marketEndUsedFallback,
        marketBenchmarkAvailable,
        yourRatingForRank,
        rank: rankInRange,
        totalRanked: combinedForRank.length,
        yourAvgVsMarketEnd:
            ownAvgInRange !== null && marketBenchmarkAvailable
                ? ownAvgInRange - marketEndAvgRating
                : null,
        yourReviewsInRange: ownRatings.length,
        marketAvgReviewGain: (() => {
            const gains = competitorsList.map((c) => {
                const meaningful = snapshotRowsTyped
                    .filter(
                        (s) =>
                            s.competitor_id === c.id &&
                            (Number(s.total_reviews) > 0 || Number(s.average_rating) > 0)
                    )
                    .sort(
                        (a, b) =>
                            new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime()
                    );
                if (meaningful.length < 2) return null;
                const first = meaningful[0];
                const last = meaningful[meaningful.length - 1];
                return Number(last.total_reviews) - Number(first.total_reviews);
            });
            const nums = gains.filter((g): g is number => g !== null);
            if (nums.length === 0) return null;
            return nums.reduce((a, b) => a + b, 0) / nums.length;
        })(),
    };

    const keywordDiscoverySplit = estimateDiscoverySplit(
        ownSearchKeywords.map((k) => ({ keyword: k.keyword, impressions: k.impressions })),
        ownBusiness?.name ?? ""
    );

    const placesMetaByCompetitorId: Record<string, CompetitorPlacesRowMeta> = {};
    const latestSnapRows = (latestSnapshotsForPlacesMetaRes.data || []) as Array<{
        competitor_id: string;
        captured_at: string;
        metadata: Record<string, unknown> | null;
    }>;
    for (const row of latestSnapRows) {
        if (placesMetaByCompetitorId[row.competitor_id]) continue;
        const parsed = parsePlacesMetaFromSnapshot(row.metadata);
        if (parsed && (parsed.primaryType || parsed.websiteUrl || parsed.summary || parsed.typesPreview)) {
            placesMetaByCompetitorId[row.competitor_id] = parsed;
        }
    }

    const rawBrief = latestMarketBriefRes.data as Record<string, unknown> | null;
    const marketBriefLatest = (() => {
        if (!rawBrief || typeof rawBrief !== "object" || !rawBrief.id) return null;
        const bullets = Array.isArray(rawBrief.positioning_bullets)
            ? rawBrief.positioning_bullets.map((x) => String(x ?? "")).filter(Boolean)
            : [];
        const actions = Array.isArray(rawBrief.opportunity_actions)
            ? rawBrief.opportunity_actions
                  .map((a) => {
                      const o = a as Record<string, unknown>;
                      return {
                          title: String(o.title ?? "").trim(),
                          detail: String(o.detail ?? "").trim(),
                      };
                  })
                  .filter((a) => a.title && a.detail)
            : [];
        return {
            id: String(rawBrief.id),
            headline: String(rawBrief.headline ?? ""),
            overview: String(rawBrief.overview ?? ""),
            positioning_bullets: bullets,
            opportunity_actions: actions,
            data_limitations: rawBrief.data_limitations != null ? String(rawBrief.data_limitations) : null,
            model: rawBrief.model != null ? String(rawBrief.model) : null,
            created_at: String(rawBrief.created_at ?? ""),
        };
    })();

    return (
        <div className="flex-1 space-y-6 p-4 pt-4 sm:p-6 sm:pt-5 lg:p-8 lg:pt-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-2">
                <div className="min-w-0">
                    <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">Competitor Monitoring</h2>
                    <p className="text-muted-foreground text-sm lg:text-base">
                        Keep track of your competitors' review performance to stay ahead.
                    </p>
                </div>
                {(recentAlertsCountRes.count ?? 0) > 0 ? (
                    <a
                        href="#competitor-alerts"
                        className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm font-medium hover:bg-muted/60"
                    >
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                            {recentAlertsCountRes.count}
                        </span>
                        Alerts in period
                    </a>
                ) : null}
            </div>

            <CompetitorsList
                businessId={businessId}
                initialCompetitors={competitors || []}
                range={range}
                snapshotRows={snapshotRowsTyped}
                eventRows={(eventsRes.data || []) as Array<{
                    id: string;
                    competitor_id: string;
                    business_id: string;
                    event_type: string;
                    title: string;
                    summary: string | null;
                    event_value: number | null;
                    event_delta: number | null;
                    created_at: string;
                }>}
                insightRows={(insightsRes.data || []) as Array<{
                    id: string;
                    competitor_id: string;
                    business_id: string;
                    range_key: string;
                    summary: string;
                    why_it_matters: string | null;
                    owner_suggestion: string | null;
                    actions: Array<{ title?: string; impact?: string; effort?: string; priority?: string }> | null;
                    priority: string;
                    confidence: number | null;
                    recommendations: string[] | null;
                    model: string | null;
                    created_at: string;
                }>}
                latestRun={
                    (latestRunRes.data as {
                        id: string;
                        run_id: string;
                        business_id: string;
                        status: string;
                        scanned: number;
                        external_updates: number;
                        snapshots_created: number;
                        events_created: number;
                        insights_created: number;
                        error_message: string | null;
                        started_at: string;
                        finished_at: string;
                        created_at: string;
                    } | null) ?? null
                }
                latestSuccessRun={
                    (latestSuccessRunRes.data as {
                        id: string;
                        run_id: string;
                        business_id: string;
                        status: string;
                        scanned: number;
                        external_updates: number;
                        snapshots_created: number;
                        events_created: number;
                        insights_created: number;
                        error_message: string | null;
                        started_at: string;
                        finished_at: string;
                        created_at: string;
                    } | null) ?? null
                }
                latestFailedRun={
                    (latestFailedRunRes.data as {
                        id: string;
                        run_id: string;
                        business_id: string;
                        status: string;
                        scanned: number;
                        external_updates: number;
                        snapshots_created: number;
                        events_created: number;
                        insights_created: number;
                        error_message: string | null;
                        started_at: string;
                        finished_at: string;
                        created_at: string;
                    } | null) ?? null
                }
                ownBusinessInRange={{
                    avgRating: ownAvgInRange,
                    reviewCount: ownRatings.length,
                }}
                benchmarkRange={benchmarkRangePayload}
                ownSearchKeywords={ownSearchKeywords}
                keywordDiscoverySplit={keywordDiscoverySplit}
                placesMetaByCompetitorId={placesMetaByCompetitorId}
                marketBriefLatest={marketBriefLatest}
                ownBusinessChart={{
                    name: ownBusiness?.name ?? "Your business",
                    averageRating:
                        visibleRollupAll.totalVisible > 0 ? visibleRollupAll.averageRatingVisible : null,
                    totalReviews: visibleRollupAll.totalVisible > 0 ? visibleRollupAll.totalVisible : null,
                }}
            />
        </div>
    );
}
