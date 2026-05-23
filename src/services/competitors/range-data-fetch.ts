import type { SupabaseClient } from "@supabase/supabase-js";
import { getCompetitorRangeStart, type CompetitorRangeKey } from "@/lib/competitors/date-range";
import { getGoogleSearchKeywords } from "@/services/google/performance-queries";
import { fetchAllReviewRowsPaginated } from "@/lib/reviews/fetch-reviews-paginated";

export type CompetitorSnapshotRow = {
  id: string;
  competitor_id: string;
  business_id: string;
  captured_at: string;
  average_rating: number;
  total_reviews: number;
  source: string;
  metadata: Record<string, unknown> | null;
};

export async function fetchCompetitorsRangeDataRaw(
  supabase: SupabaseClient,
  businessId: string,
  range: CompetitorRangeKey
) {
  const rangeStart = getCompetitorRangeStart(range);

  const [
    { data: competitors, error: competitorsError },
    { data: ownBusiness },
  ] = await Promise.all([
    supabase
      .from("competitors")
      .select("id, business_id, name, google_url, average_rating, total_reviews, created_at, updated_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false }),
    supabase
      .from("businesses")
      .select("id, name, average_rating, total_reviews")
      .eq("id", businessId)
      .maybeSingle(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
  const snapshotsPromise = (supabase.from("competitor_snapshots" as never) as any)
    .select("id, competitor_id, business_id, captured_at, average_rating, total_reviews, source, metadata")
    .eq("business_id", businessId)
    .gte("captured_at", rangeStart.toISOString())
    .order("captured_at", { ascending: false })
    .limit(1000);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
  const eventsPromise = (supabase.from("competitor_events" as never) as any)
    .select("id, competitor_id, business_id, event_type, title, summary, event_value, event_delta, created_at")
    .eq("business_id", businessId)
    .gte("created_at", rangeStart.toISOString())
    .order("created_at", { ascending: false })
    .limit(200);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
  const insightsPromise = (supabase.from("competitor_insights" as never) as any)
    .select("id, competitor_id, business_id, range_key, summary, why_it_matters, owner_suggestion, actions, priority, confidence, recommendations, model, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(100);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
  const latestSnapshotsForPlacesMetaPromise = (supabase.from("competitor_snapshots" as never) as any)
    .select("competitor_id, captured_at, metadata")
    .eq("business_id", businessId)
    .order("captured_at", { ascending: false })
    .limit(400);

  const [snapshotsRes, eventsRes, insightsRes, ownReviewsInRangeRes, latestSnapshotsForPlacesMetaRes, ownSearchKeywords] =
    await Promise.all([
      snapshotsPromise,
      eventsPromise,
      insightsPromise,
      ownReviewsInRangePromise,
      latestSnapshotsForPlacesMetaPromise,
      getGoogleSearchKeywords(supabase, businessId, 15),
    ]);

  return {
    competitorsError,
    snapshotsRes,
    eventsRes,
    insightsRes,
    ownReviewsInRangeRes,
    latestSnapshotsForPlacesMetaRes,
    ownSearchKeywords,
    competitors: competitors || [],
    ownBusiness,
  };
}
