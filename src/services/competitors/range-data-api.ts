import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { normalizeCompetitorRange } from "@/lib/competitors/date-range";
import { fetchCompetitorsRangeDataRaw, type CompetitorSnapshotRow } from "./range-data-fetch";
import { buildCompetitorsRangeDataPayload } from "./range-data-response";

export async function handleCompetitorsRangeDataGet(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { businessId } = await getActiveBusinessId();
  if (!businessId) return NextResponse.json({ error: "No active business" }, { status: 400 });

  const url = new URL(request.url);
  const range = normalizeCompetitorRange(url.searchParams.get("range") ?? undefined);

  const raw = await fetchCompetitorsRangeDataRaw(supabase, businessId, range);

  if (
    raw.competitorsError ||
    raw.snapshotsRes.error ||
    raw.eventsRes.error ||
    raw.insightsRes.error ||
    raw.ownReviewsInRangeRes.error ||
    raw.latestSnapshotsForPlacesMetaRes.error
  ) {
    return NextResponse.json({ error: "Failed to load competitors range data" }, { status: 500 });
  }

  const snapshotRowsTyped = (raw.snapshotsRes.data || []) as CompetitorSnapshotRow[];
  const ownRatings = (raw.ownReviewsInRangeRes.data || []).map((r: { rating: number }) => Number(r.rating));
  const latestSnapRows = (raw.latestSnapshotsForPlacesMetaRes.data || []) as Array<{
    competitor_id: string;
    captured_at: string;
    metadata: Record<string, unknown> | null;
  }>;

  const payload = buildCompetitorsRangeDataPayload({
    range,
    competitorsList: raw.competitors,
    snapshotRowsTyped,
    eventRows: raw.eventsRes.data || [],
    insightRows: raw.insightsRes.data || [],
    ownRatings,
    ownBusiness: raw.ownBusiness,
    ownSearchKeywords: raw.ownSearchKeywords,
    latestSnapRows,
  });

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
    },
  });
}
