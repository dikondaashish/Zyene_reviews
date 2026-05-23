import type { Database } from "@/lib/db/supabase/database.types";
import type { CompetitorRangeKey } from "@/lib/competitors/date-range";
import type { CompetitorPlacesRowMeta } from "@/lib/competitors/places-snapshot-meta";
import type { CompetitorMovementRow } from "@/lib/competitors/snapshot-movement";

export type Competitor = Database["public"]["Tables"]["competitors"]["Row"];

export type CompetitorSnapshot = {
    id: string;
    competitor_id: string;
    business_id: string;
    captured_at: string;
    average_rating: number;
    total_reviews: number;
    source: string;
    metadata: Record<string, unknown> | null;
};

export type CompetitorEvent = {
    id: string;
    competitor_id: string;
    business_id: string;
    event_type: string;
    title: string;
    summary: string | null;
    event_value: number | null;
    event_delta: number | null;
    created_at: string;
};

export type CompetitorInsight = {
    id: string;
    competitor_id: string;
    business_id: string;
    range_key: string;
    summary: string;
    why_it_matters?: string | null;
    owner_suggestion?: string | null;
    actions?: Array<{ title?: string; impact?: string; effort?: string; priority?: string }> | null;
    priority: string;
    confidence: number | null;
    recommendations: string[] | null;
    model: string | null;
    created_at: string;
};

export type CompetitorWatchRun = {
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
};

export type CompetitorMarketBriefLatest = {
    id: string;
    headline: string;
    overview: string;
    positioning_bullets: string[];
    opportunity_actions: Array<{ title: string; detail: string }>;
    data_limitations: string | null;
    model: string | null;
    created_at: string;
};

export type CompetitorWatchBenchmarkRange = {
    label: string;
    marketEndAvgRating: number;
    marketEndUsedFallback: boolean;
    marketBenchmarkAvailable: boolean;
    yourRatingForRank: number;
    rank: number | null;
    totalRanked: number;
    yourAvgVsMarketEnd: number | null;
    yourReviewsInRange: number;
    marketAvgReviewGain: number | null;
};

export type CompetitorChartDataEntry = {
    name: string;
    fullName: string;
    rating: number;
    reviews: number;
    isOwn: boolean;
};

export type CompetitorsListProps = {
    businessId: string;
    initialCompetitors: Competitor[];
    range: CompetitorRangeKey;
    snapshotRows: CompetitorSnapshot[];
    eventRows: CompetitorEvent[];
    insightRows: CompetitorInsight[];
    latestRun: CompetitorWatchRun | null;
    latestSuccessRun: CompetitorWatchRun | null;
    latestFailedRun: CompetitorWatchRun | null;
    ownBusinessInRange: {
        avgRating: number | null;
        reviewCount: number;
    };
    benchmarkRange: CompetitorWatchBenchmarkRange;
    ownSearchKeywords: Array<{ keyword: string; impressions: number; monthStart: string }>;
    keywordDiscoverySplit: { discoveryPct: number; directPct: number };
    placesMetaByCompetitorId: Record<string, CompetitorPlacesRowMeta>;
    marketBriefLatest: CompetitorMarketBriefLatest | null;
    /** Stored listing aggregates for the active business (same basis as competitor totals from Places). */
    ownBusinessChart: {
        name: string;
        averageRating: number | null;
        totalReviews: number | null;
    };
};

export type CompetitorsTableSectionProps = {
    competitors: Competitor[];
    activeBenchmarkRange: CompetitorWatchBenchmarkRange;
    activeOwnBusinessInRange: {
        avgRating: number | null;
        reviewCount: number;
    };
    activePlacesMetaByCompetitorId: Record<string, CompetitorPlacesRowMeta>;
    latestSnapshotByCompetitor: Map<string, CompetitorSnapshot>;
    latestInsightByCompetitor: Map<string, CompetitorInsight>;
    movementCards: CompetitorMovementRow[];
    activeEventRows: CompetitorEvent[];
    rangeLabel: string;
    isSyncing: (competitor: Competitor) => boolean;
    isDeleting: string | null;
    onDeleteRequest: (id: string) => void;
};

export type CompetitorsChartsSectionProps = {
    chartData: CompetitorChartDataEntry[];
};
