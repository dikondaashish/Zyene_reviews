import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import type { MarketPositioningBriefInput } from "@/domains/ai/services/generateMarketPositioningBrief";
import { parsePlacesMetaFromSnapshot } from "@/lib/competitors/places-snapshot-meta";
import { estimateDiscoverySplit, getGoogleSearchKeywords } from "@/services/google/performance-queries";
import { countVisibleReviewsForBusiness } from "@/lib/reviews/count-visible-reviews";

export async function loadMarketPositioningBriefContext(
    supabase: SupabaseClient<Database>,
    businessId: string
): Promise<{ ok: true; input: MarketPositioningBriefInput } | { ok: false; error: string }> {
    const { data: business, error: bErr } = await supabase
        .from("businesses")
        .select("id, name, average_rating, total_reviews")
        .eq("id", businessId)
        .maybeSingle();

    if (bErr || !business) {
        return { ok: false, error: "Business not found." };
    }

    const { count: visibleReviewTotal } = await countVisibleReviewsForBusiness(supabase, businessId);

    const { data: competitors, error: cErr } = await supabase
        .from("competitors")
        .select("id, name, average_rating, total_reviews")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

    if (cErr) {
        return { ok: false, error: "Could not load competitors." };
    }

    if (!competitors?.length) {
        return { ok: false, error: "Add at least one tracked competitor to generate a positioning brief." };
    }

    const [keywords, snapshotsRes] = await Promise.all([
        getGoogleSearchKeywords(supabase, businessId, 15),
        (supabase.from("competitor_snapshots" as never) as any)
            .select("competitor_id, captured_at, metadata")
            .eq("business_id", businessId)
            .order("captured_at", { ascending: false })
            .limit(400),
    ]);

    if (snapshotsRes.error) {
        return { ok: false, error: "Could not load snapshot metadata." };
    }

    const metaByCompetitor: Record<string, ReturnType<typeof parsePlacesMetaFromSnapshot>> = {};
    const rows = (snapshotsRes.data || []) as Array<{
        competitor_id: string;
        metadata: Record<string, unknown> | null;
    }>;
    for (const row of rows) {
        if (metaByCompetitor[row.competitor_id]) continue;
        metaByCompetitor[row.competitor_id] = parsePlacesMetaFromSnapshot(row.metadata);
    }

    const split = estimateDiscoverySplit(
        keywords.map((k) => ({ keyword: k.keyword, impressions: k.impressions })),
        business.name ?? ""
    );

    const competitorPayload = competitors.map((c) => {
        const places = metaByCompetitor[c.id];
        return {
            name: c.name,
            rating: c.average_rating != null ? Number(c.average_rating) : null,
            reviewCount: c.total_reviews != null ? Number(c.total_reviews) : null,
            primaryCategory: places?.primaryType ?? null,
            typesPreview: places?.typesPreview ?? null,
            publicSummary: places?.summary ?? null,
        };
    });

    const input: MarketPositioningBriefInput = {
        businessName: business.name ?? "Your business",
        yourRating: business.average_rating != null ? Number(business.average_rating) : null,
        yourReviewCount: visibleReviewTotal,
        yourTopKeywords: keywords.map((k) => ({ keyword: k.keyword, impressions: k.impressions })),
        keywordDiscoveryPct: split.discoveryPct,
        keywordDirectPct: split.directPct,
        competitors: competitorPayload,
    };

    return { ok: true, input };
}
