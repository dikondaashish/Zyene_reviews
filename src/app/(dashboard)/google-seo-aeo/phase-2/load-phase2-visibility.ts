import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { computeRepeatVariance } from "@/services/aeo/analytics/sampling-variance";
import { computeClusterRollups, type ClusterFact } from "@/services/aeo/analytics/cluster-rollup";
import { computeSourceOverlap } from "@/services/aeo/analytics/source-overlap";
import type { Phase2VisibilityData } from "./phase2-types";
import { assertAeoQueriesSucceeded } from "@/services/aeo/query-results";

type Db = SupabaseClient<Database>;

export async function loadPhase2Visibility(db: Db, businessId: string): Promise<Phase2VisibilityData> {
    const since = new Date(Date.now() - 90 * 86_400_000).toISOString();
    const [sampleResult, promptResult, citationResult, changeResult, mentionResult] = await Promise.all([
        db.from("aeo_samples").select("id, run_id, prompt_id, engine_id, attempt, status, sampled_at")
            .eq("business_id", businessId).eq("is_estimated", false).gte("sampled_at", since).order("sampled_at"),
        db.from("aeo_prompts").select("id, prompt_text, cluster_id, aeo_prompt_clusters(name)").eq("business_id", businessId),
        db.from("aeo_citations").select("sample_id, domain, classification, normalized_url").eq("business_id", businessId).gte("created_at", since),
        db.from("aeo_citation_changes" as never).select("normalized_url, change_type, engine_id, detected_at" as never)
            .eq("business_id" as never, businessId as never).order("detected_at" as never, { ascending: false }).limit(30),
        db.from("aeo_brand_mentions" as never).select("sample_id, brand_kind, brand_label, sentiment, sentiment_rationale, prominence_score, attributes" as never)
            .eq("business_id" as never, businessId as never).gte("created_at" as never, since as never),
    ]);
    assertAeoQueriesSucceeded("Unable to load Phase 2 visibility", sampleResult, promptResult,
        citationResult, changeResult, mentionResult);
    const samples = sampleResult.data ?? [];
    const mentions = ((mentionResult as unknown as { data: Array<{ sample_id: string; brand_kind: string; brand_label: string; sentiment: string | null; sentiment_rationale: string | null; prominence_score: number | null; attributes: unknown }> | null }).data ?? []);
    const ownNamed = new Set(mentions.filter((row) => row.brand_kind === "own").map((row) => row.sample_id));
    const mentionsBySample = new Map<string, { own: number; total: number }>();
    for (const mention of mentions.filter((row) => row.brand_kind !== "unknown")) {
        const count = mentionsBySample.get(mention.sample_id) ?? { own: 0, total: 0 };
        count.total += 1; if (mention.brand_kind === "own") count.own += 1;
        mentionsBySample.set(mention.sample_id, count);
    }
    const prompts = new Map((promptResult.data ?? []).map((row) => [row.id, row]));
    const repeatGroups = new Map<string, typeof samples>();
    for (const sample of samples.filter((row) => row.status === "ok" && row.prompt_id)) {
        const key = `${sample.run_id}:${sample.prompt_id}:${sample.engine_id}`;
        repeatGroups.set(key, [...(repeatGroups.get(key) ?? []), sample]);
    }
    const variance = [...repeatGroups.values()].filter((rows) => rows.length > 1).map((rows) => {
        const result = computeRepeatVariance(rows.map((row) => ownNamed.has(row.id)));
        const prompt = prompts.get(rows[0]?.prompt_id ?? "");
        return { label: `${prompt?.prompt_text ?? "Prompt"} · ${rows[0]?.engine_id}`, attempts: result.attempts, rate: result.rate, low: result.confidence95.low, high: result.confidence95.high };
    }).slice(0, 20);
    const clusterFacts: ClusterFact[] = samples.flatMap((sample) => {
        if (!sample.prompt_id) return [];
        const prompt = prompts.get(sample.prompt_id);
        if (!prompt?.cluster_id) return [];
        const counts = mentionsBySample.get(sample.id) ?? { own: 0, total: 0 };
        return [{ clusterId: prompt.cluster_id, clusterName: prompt.aeo_prompt_clusters?.name ?? "Unclustered", status: sample.status as ClusterFact["status"], ownNamed: ownNamed.has(sample.id), trackedMentions: counts.total, ownMentions: counts.own }];
    });
    const clusters = computeClusterRollups(clusterFacts).map((row) => ({ name: row.clusterName, observations: row.observations, visibility: row.visibilityRate, sov: row.shareOfVoice }));
    const sourceGaps = computeSourceOverlap((citationResult.data ?? []).flatMap((row) => row.classification === "own" || row.classification === "competitor" ? [{ domain: row.domain, brandKind: row.classification }] : [])).slice(0, 20);
    const changes = ((changeResult as unknown as { data: Array<{ normalized_url: string; change_type: string; engine_id: string; detected_at: string }> | null }).data ?? []);
    return {
        variance, clusters, sourceGaps: sourceGaps.map((row) => ({ domain: row.domain, competitorCitations: row.competitorCitations })),
        citationChanges: changes.map((row) => ({ url: row.normalized_url, type: row.change_type, engine: row.engine_id, at: row.detected_at })),
        mentions: mentions.slice(0, 50).map((row) => ({ brand: row.brand_label, sentiment: row.sentiment, rationale: row.sentiment_rationale, prominence: row.prominence_score, attributes: row.attributes })),
    };
}
