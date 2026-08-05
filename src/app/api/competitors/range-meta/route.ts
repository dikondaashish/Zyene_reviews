import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import {
  getCompetitorRangeStart,
  normalizeCompetitorRange,
  type CompetitorRangeKey,
} from "@/lib/competitors/date-range";

type RangeMetaResponse = {
  range: CompetitorRangeKey;
  competitorCount: number;
  snapshotCount: number;
  eventCount: number;
  insightCount: number;
  alertsCount: number;
};

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { businessId } = await getActiveBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "No active business" }, { status: 400 });
  }

  const url = new URL(request.url);
  const range = normalizeCompetitorRange(url.searchParams.get("range") ?? undefined);
  const rangeStart = getCompetitorRangeStart(range);

  const [
    competitorsRes,
    snapshotsRes,
    eventsRes,
    insightsRes,
    alertsRes,
  ] = await Promise.all([
    supabase
      .from("competitors")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
    supabase.from("competitor_snapshots")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("captured_at", rangeStart.toISOString()),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
    supabase.from("competitor_events")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("created_at", rangeStart.toISOString()),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
    supabase.from("competitor_insights")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("created_at", rangeStart.toISOString()),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
    supabase.from("competitor_events")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("created_at", rangeStart.toISOString())
      .like("event_type", "competitor.alert.%"),
  ]);

  if (
    competitorsRes.error ||
    snapshotsRes.error ||
    eventsRes.error ||
    insightsRes.error ||
    alertsRes.error
  ) {
    return NextResponse.json(
      { error: "Failed to fetch competitor range metadata" },
      { status: 500 }
    );
  }

  const payload: RangeMetaResponse = {
    range,
    competitorCount: competitorsRes.count ?? 0,
    snapshotCount: snapshotsRes.count ?? 0,
    eventCount: eventsRes.count ?? 0,
    insightCount: insightsRes.count ?? 0,
    alertsCount: alertsRes.count ?? 0,
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
    },
  });
}
