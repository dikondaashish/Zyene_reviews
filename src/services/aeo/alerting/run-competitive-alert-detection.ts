import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { detectCompetitorOvertakes, detectNegativeSentimentSpike, type CompetitiveMentionFact } from "./detect-competitive-alerts";
import { SupabaseAlertStore } from "./alert-store";

type SampleRow = { id: string; prompt_id: string | null; sampled_at: string };

export async function runCompetitiveAlertDetection(
    db: SupabaseClient<Database>, store: SupabaseAlertStore,
    input: { businessId: string; organizationId: string }, samples: SampleRow[], okSampleIds: string[]
): Promise<number> {
    const sampleById = new Map(samples.map((row) => [row.id, row]));
    const { data: rows } = okSampleIds.length
        ? await db.from("aeo_brand_mentions").select("sample_id, brand_kind, brand_label, sentiment")
            .eq("business_id", input.businessId).in("sample_id", okSampleIds)
        : { data: [] };
    const facts: CompetitiveMentionFact[] = (rows ?? []).flatMap((mention) => {
        const sample = sampleById.get(mention.sample_id);
        return sample?.prompt_id ? [{ promptId: sample.prompt_id, sampleId: sample.id, sampledAt: sample.sampled_at,
            brandKind: mention.brand_kind as CompetitiveMentionFact["brandKind"], brandLabel: mention.brand_label,
            sentiment: mention.sentiment as CompetitiveMentionFact["sentiment"] }] : [];
    });
    let created = 0;
    for (const overtake of detectCompetitorOvertakes(facts)) {
        const result = await store.createIfNotCoolingDown({
            businessId: input.businessId, organizationId: input.organizationId,
            alertType: "competitor_overtake", severity: "high", promptId: null, engineId: null,
            title: `${overtake.competitor} passed you on ${overtake.promptIds.length} prompt${overtake.promptIds.length === 1 ? "" : "s"}`,
            detail: "The competitor moved from at-or-below your mention count to above it in the recent sampling window.",
            evidence: { competitor: overtake.competitor, promptIds: overtake.promptIds },
        });
        if (result) created += 1;
    }
    const spike = detectNegativeSentimentSpike(facts);
    if (spike) {
        const result = await store.createIfNotCoolingDown({
            businessId: input.businessId, organizationId: input.organizationId,
            alertType: "negative_sentiment_spike", severity: "high", promptId: null, engineId: null,
            title: "Negative AI sentiment increased",
            detail: `Negative mentions rose from ${Math.round(spike.baselineRate * 100)}% to ${Math.round(spike.recentRate * 100)}%.`,
            evidence: spike,
        });
        if (result) created += 1;
    }
    return created;
}
