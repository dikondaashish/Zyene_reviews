import type { SupabaseClient } from "@supabase/supabase-js";

export type RecommendationSnapshot = { successfulSamples: number; visibilityRate: number | null; targetCitations: number };

export async function loadRecommendationSnapshot(db: SupabaseClient, businessId: string, targetUrl: string | null): Promise<RecommendationSnapshot> {
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const samples = await db.from("aeo_samples").select("id").eq("business_id", businessId).eq("status", "ok").eq("is_estimated", false).gte("sampled_at", since);
    const ids = (samples.data ?? []).map((row) => String(row.id));
    const mentions = ids.length ? await db.from("aeo_brand_mentions").select("sample_id").eq("business_id", businessId).eq("brand_kind", "own").eq("cited_only", false).in("sample_id", ids) : { data: [] };
    let targetCitations = 0;
    if (targetUrl) {
        const citations = await db.from("aeo_citations").select("id").eq("business_id", businessId).eq("normalized_url", targetUrl).gte("created_at", since);
        targetCitations = citations.data?.length ?? 0;
    }
    const named = new Set((mentions.data ?? []).map((row) => row.sample_id)).size;
    return { successfulSamples: ids.length, visibilityRate: ids.length ? named / ids.length : null, targetCitations };
}

export function recommendationDelta(baseline: RecommendationSnapshot, latest: RecommendationSnapshot) {
    return {
        successfulSamples: latest.successfulSamples,
        visibilityDelta: baseline.visibilityRate === null || latest.visibilityRate === null ? null : latest.visibilityRate - baseline.visibilityRate,
        citationDelta: latest.targetCitations - baseline.targetCitations,
        measuredAt: new Date().toISOString(),
    };
}
