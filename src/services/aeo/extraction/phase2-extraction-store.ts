import type { SupabaseClient } from "@supabase/supabase-js";
import type { EngineSampleOk } from "../engines/engine-types";
import type { SampleExtraction } from "./extract-sample";
import type { MentionAnalysis } from "../analytics/mention-analyzer";
import { diffCitationSets } from "../analytics/citation-history";
import { matchReviewCorpus } from "../analytics/review-citation-matcher";

/** Persists Phase 2 enrichments after the measured sample and Phase 1 extraction are durable. */
export class Phase2ExtractionStore {
    constructor(private readonly db: SupabaseClient) {}

    async persist(input: {
        sampleId: string;
        businessId: string;
        promptId: string;
        engineId: string;
        result: EngineSampleOk;
        extraction: SampleExtraction;
        analyses: readonly MentionAnalysis[];
    }): Promise<{ reviewMatches: number; citationChanges: number; enrichedMentions: number }> {
        const [reviewMatches, citationChanges, enrichedMentions] = await Promise.all([
            this.persistReviewMatches(input),
            this.persistCitationChanges(input),
            this.persistMentionAnalysis(input),
        ]);
        return { reviewMatches, citationChanges, enrichedMentions };
    }

    private async persistReviewMatches(input: {
        sampleId: string; businessId: string; result: EngineSampleOk;
    }): Promise<number> {
        const { data, error } = await this.db.from("reviews")
            .select("id, text")
            .eq("business_id", input.businessId)
            .not("text", "is", null)
            .order("review_date", { ascending: false })
            .limit(500);
        if (error) throw new Error(`load review corpus: ${error.message}`);
        const matches = matchReviewCorpus(input.result.answerText, (data ?? []).flatMap((row) =>
            typeof row.text === "string" ? [{ id: String(row.id), text: row.text }] : []
        ));
        if (matches.length === 0) return 0;
        const inserted = await this.db.from("aeo_review_citation_matches").upsert(matches.map((match) => ({
            business_id: input.businessId,
            sample_id: input.sampleId,
            review_id: match.reviewId,
            answer_excerpt: match.answerExcerpt,
            review_excerpt: match.reviewExcerpt,
            match_kind: match.matchKind,
            confidence: match.confidence,
            extraction_model_id: "lexical-candidate-v1",
        })), { onConflict: "sample_id,review_id,answer_excerpt", ignoreDuplicates: true });
        if (inserted.error) throw new Error(`persist review matches: ${inserted.error.message}`);
        return matches.length;
    }

    private async persistCitationChanges(input: {
        sampleId: string; businessId: string; promptId: string; engineId: string; extraction: SampleExtraction;
    }): Promise<number> {
        const current = await this.db.from("aeo_samples").select("sampled_at")
            .eq("id", input.sampleId).single();
        if (current.error) throw new Error(`load current sample: ${current.error.message}`);
        const previous = await this.db.from("aeo_samples").select("id")
            .eq("business_id", input.businessId).eq("prompt_id", input.promptId)
            .eq("engine_id", input.engineId).eq("status", "ok")
            .lt("sampled_at", current.data.sampled_at)
            .order("sampled_at", { ascending: false }).limit(1).maybeSingle();
        if (previous.error) throw new Error(`load previous sample: ${previous.error.message}`);
        if (!previous.data) return 0;
        const previousId = previous.data.id;
        const before = await this.db.from("aeo_citations").select("normalized_url, ordinal")
            .eq("sample_id", previousId);
        if (before.error) throw new Error(`load previous citations: ${before.error.message}`);
        const changes = diffCitationSets(
            (before.data ?? []).map((row) => ({ url: String(row.normalized_url), ordinal: Number(row.ordinal) })),
            input.extraction.citations.map((row, index) => ({ url: row.normalizedUrl, ordinal: index + 1 }))
        );
        if (changes.length === 0) return 0;
        const written = await this.db.from("aeo_citation_changes").upsert(changes.map((change) => ({
            business_id: input.businessId,
            prompt_id: input.promptId,
            engine_id: input.engineId,
            normalized_url: change.normalizedUrl,
            change_type: change.changeType,
            previous_ordinal: change.previousOrdinal,
            current_ordinal: change.currentOrdinal,
            previous_sample_id: previousId,
            current_sample_id: input.sampleId,
        })), { onConflict: "business_id,engine_id,normalized_url,previous_sample_id,current_sample_id" });
        if (written.error) throw new Error(`persist citation changes: ${written.error.message}`);
        return changes.length;
    }

    private async persistMentionAnalysis(input: {
        sampleId: string; extraction: SampleExtraction; analyses: readonly MentionAnalysis[];
    }): Promise<number> {
        const byBrand = new Map(input.analyses.map((item) => [item.brand.toLowerCase(), item]));
        let count = 0;
        for (const mention of input.extraction.mentions) {
            const analysis = byBrand.get(mention.label.toLowerCase());
            const result = await this.db.from("aeo_brand_mentions").update({
                prominence_score: mention.citedOnly ? 0 : 1 / mention.mentionOrdinal,
                sentiment: analysis?.sentiment ?? null,
                sentiment_rationale: analysis?.rationale ?? null,
                attributes: analysis?.attributes ?? [],
            }).eq("sample_id", input.sampleId).eq("brand_label", mention.label);
            if (result.error) throw new Error(`persist mention analysis: ${result.error.message}`);
            count += 1;
        }
        return count;
    }
}
