import type { SupabaseClient } from "@supabase/supabase-js";
import { mineReviewThemes } from "./review-mining";
import { rankFreshnessQueue } from "./freshness-queue";
import { loadRecommendationSnapshot, recommendationDelta, type RecommendationSnapshot } from "./recommendation-impact";

export async function refreshRecommendations(db: SupabaseClient, businessId: string): Promise<void> {
    const [existing, changes, reviews, briefs, applied] = await Promise.all([
        db.from("aeo_recommendations").select("title" as never).eq("business_id" as never, businessId as never),
        db.from("aeo_citation_changes").select("normalized_url, change_type, detected_at" as never).eq("business_id" as never, businessId as never).gte("detected_at" as never, new Date(Date.now() - 90 * 86_400_000).toISOString() as never),
        db.from("reviews").select("text").eq("business_id", businessId).not("text", "is", null).order("review_date", { ascending: false }).limit(200),
        db.from("aeo_content_briefs").select("id, prompt_id, target_page_url, rewrite_after" as never).eq("business_id", businessId).not("rewrite_after" as never, "is" as never, null as never),
        db.from("aeo_recommendations").select("id, target_url, baseline" as never).eq("business_id" as never, businessId as never).eq("status" as never, "applied" as never),
    ]);
    const titles = new Set(((existing as unknown as { data: { title: string }[] | null }).data ?? []).map((row) => row.title));
    const changeRows = (changes as unknown as { data: { normalized_url: string; change_type: string; detected_at: string }[] | null }).data ?? [];
    const lost = new Map<string, number>();
    for (const row of changeRows.filter((row) => row.change_type === "lost")) lost.set(row.normalized_url, (lost.get(row.normalized_url) ?? 0) + 1);
    const freshness = rankFreshnessQueue([...lost].map(([url, lostCitations]) => ({ url, lostCitations, rankDrop: 0, daysSinceUpdate: 0 })));
    const themes = mineReviewThemes((reviews.data ?? []).flatMap((row) => typeof row.text === "string" ? [row.text] : []));
    const briefRows = (briefs as unknown as { data: { id: string; prompt_id: string | null; target_page_url: string | null; rewrite_after: string | null }[] | null }).data ?? [];
    const candidates = [
        ...freshness.slice(0, 10).map((row) => ({ recommendation_type: "freshness", title: `Refresh ${row.url}`, target_url: row.url, detail: row })),
        ...themes.slice(0, 5).map((row) => ({ recommendation_type: "review_brief", title: `Build content around “${row.theme}”`, target_url: null, detail: row })),
        ...briefRows.filter((row) => row.rewrite_after).map((row) => ({ recommendation_type: "rewrite", title: `Apply rewrite for ${row.target_page_url ?? "a new page"}`, target_url: row.target_page_url, detail: { briefId: row.id, rewrite: row.rewrite_after }, prompt_id: row.prompt_id, content_brief_id: row.id })),
    ].filter((row) => !titles.has(row.title));
    if (candidates.length) await db.from("aeo_recommendations").upsert(candidates.map((row) => ({ business_id: businessId, ...row })), { onConflict: "business_id,recommendation_type,title", ignoreDuplicates: true });
    const appliedRows = (applied as unknown as { data: { id: string; target_url: string | null; baseline: RecommendationSnapshot }[] | null }).data ?? [];
    for (const row of appliedRows) {
        const latest = await loadRecommendationSnapshot(db, businessId, row.target_url);
        await db.from("aeo_recommendations").update({ latest_impact: recommendationDelta(row.baseline, latest), updated_at: new Date().toISOString() }).eq("id", row.id);
    }
}
