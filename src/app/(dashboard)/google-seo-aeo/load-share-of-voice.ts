import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { computeShareOfVoice, type ShareOfVoiceResult } from "@/services/aeo/reporting/share-of-voice";
import { VISIBILITY_WINDOW_DAYS } from "@/services/aeo/reporting/load-visibility-facts";
import { assertAeoQueriesSucceeded } from "@/services/aeo/query-results";

/**
 * F3.2: null when this business has never been sampled — distinct from a
 * suppressed-but-sampled ShareOfVoiceResult, same reasoning as aeoVisibility.
 * Reads through the caller's RLS-scoped client.
 */
export async function loadShareOfVoice(
    db: SupabaseClient<Database>,
    businessId: string
): Promise<ShareOfVoiceResult | null> {
    const windowStart = new Date(Date.now() - VISIBILITY_WINDOW_DAYS * 86_400_000).toISOString();

    const [sampleResult, competitorResult] = await Promise.all([
        db.from("aeo_samples").select("id, status").eq("business_id", businessId).gte("sampled_at", windowStart),
        db.from("competitors").select("id", { count: "exact", head: true }).eq("business_id", businessId),
    ]);
    assertAeoQueriesSucceeded("Unable to load AEO share of voice", sampleResult, competitorResult);
    const samples = sampleResult.data;
    const competitorCount = competitorResult.count;

    if (!samples || samples.length === 0) return null;

    const observationSampleIds = samples.filter((s) => s.status === "ok").map((s) => s.id);

    const mentionResult = observationSampleIds.length
        ? await db
              .from("aeo_brand_mentions")
              .select("sample_id, brand_kind, competitor_id, brand_label")
              .eq("business_id", businessId)
              .eq("cited_only", false)
              .in("sample_id", observationSampleIds)
        : { data: [], error: null };
    assertAeoQueriesSucceeded("Unable to load AEO share-of-voice mentions", mentionResult);
    const mentions = mentionResult.data;

    return computeShareOfVoice({
        observationSampleIds,
        mentions: (mentions ?? []).map((m) => ({
            sampleId: m.sample_id,
            brandKind: m.brand_kind as "own" | "competitor",
            competitorId: m.competitor_id,
            brandLabel: m.brand_label,
        })),
        competitorCount: competitorCount ?? 0,
    });
}
