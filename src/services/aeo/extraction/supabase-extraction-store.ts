import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { canonicalDomain } from "./citation-normalizer";
import type { BrandContext } from "./extract-sample";
import type { SampleExtraction } from "./extract-sample";
import type { BrandAlias } from "./brand-matcher";

type Admin = SupabaseClient<Database>;

/**
 * Loads what a business's answers should be matched against, and stores what was
 * found.
 *
 * Writes are idempotent on sample_id: extraction is re-runnable by design (a
 * better matcher, a newly added competitor), so a second pass replaces the first
 * rather than doubling every mention.
 */
export class SupabaseExtractionStore {
    constructor(private readonly db: Admin) {}

    async loadBrandContext(businessId: string): Promise<BrandContext> {
        const [business, competitors, aliases] = await Promise.all([
            this.db.from("businesses").select("name, website").eq("id", businessId).single(),
            this.db.from("competitors").select("id, name").eq("business_id", businessId),
            this.db
                .from("aeo_competitor_aliases")
                .select("competitor_id, alias")
                .eq("business_id", businessId),
        ]);

        if (business.error) throw new Error(`loadBrandContext: ${business.error.message}`);
        if (competitors.error) throw new Error(`loadBrandContext: ${competitors.error.message}`);
        if (aliases.error) throw new Error(`loadBrandContext: ${aliases.error.message}`);

        const aliasesByCompetitor = new Map<string, string[]>();
        for (const row of aliases.data ?? []) {
            const list = aliasesByCompetitor.get(row.competitor_id) ?? [];
            list.push(row.alias);
            aliasesByCompetitor.set(row.competitor_id, list);
        }

        const brands: BrandAlias[] = [
            {
                kind: "own",
                competitorId: null,
                label: business.data.name,
                aliases: [business.data.name],
            },
            ...(competitors.data ?? []).map((c) => ({
                kind: "competitor" as const,
                competitorId: c.id,
                label: c.name,
                // The canonical name always counts as an alias; extras are additive.
                aliases: [c.name, ...(aliasesByCompetitor.get(c.id) ?? [])],
            })),
        ];

        return {
            brands,
            ownDomains: domainsOf(business.data.website),
            /**
             * EMPTY, and knowingly so. `competitors` stores a google_url (a Maps
             * link), not the competitor's own website, so there is no domain to
             * match a citation against. Guessing one from the name would be a
             * fabrication of exactly the kind this module exists to remove.
             *
             * Consequence, worth knowing before reading a report: a citation to
             * a competitor's own site classifies as `other`, not `competitor`.
             * Competitor mentions in the ANSWER TEXT are unaffected — those match
             * on name and work today. Closing this needs a competitor website
             * captured at onboarding or resolved from the Maps URL.
             */
            competitorDomains: [],
        };
    }

    async persist(
        sampleId: string,
        businessId: string,
        extraction: SampleExtraction
    ): Promise<{ mentions: number; citations: number }> {
        // Replace rather than append. Re-extraction is expected, and appending
        // would multiply every mention by the number of passes.
        const clearMentions = await this.db
            .from("aeo_brand_mentions")
            .delete()
            .eq("sample_id", sampleId);
        if (clearMentions.error) throw new Error(`clear mentions: ${clearMentions.error.message}`);

        const clearCitations = await this.db
            .from("aeo_citations")
            .delete()
            .eq("sample_id", sampleId);
        if (clearCitations.error) throw new Error(`clear citations: ${clearCitations.error.message}`);

        if (extraction.mentions.length > 0) {
            const { error } = await this.db.from("aeo_brand_mentions").insert(
                extraction.mentions.map((m) => ({
                    sample_id: sampleId,
                    business_id: businessId,
                    brand_kind: m.kind,
                    competitor_id: m.competitorId,
                    brand_label: m.label,
                    mention_ordinal: m.mentionOrdinal,
                    cited_only: m.citedOnly,
                    // Sentiment is a separate LLM pass. NULL means "not assessed",
                    // which is not the same as neutral and must stay distinct.
                    sentiment: null,
                    extraction_model_id: extraction.extractionModelId,
                }))
            );
            if (error) throw new Error(`insert mentions: ${error.message}`);
        }

        if (extraction.citations.length > 0) {
            const { error } = await this.db.from("aeo_citations").insert(
                extraction.citations.map((c, index) => ({
                    sample_id: sampleId,
                    business_id: businessId,
                    ordinal: index + 1,
                    url: c.url,
                    normalized_url: c.normalizedUrl,
                    domain: c.domain,
                    title: c.title,
                    classification: c.classification,
                }))
            );
            if (error) throw new Error(`insert citations: ${error.message}`);
        }

        return { mentions: extraction.mentions.length, citations: extraction.citations.length };
    }
}

/** A website field may be blank, or a bare host, or a full URL. */
function domainsOf(website: string | null): string[] {
    if (!website?.trim()) return [];
    const raw = website.trim();
    try {
        const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
        return [canonicalDomain(url.hostname)];
    } catch {
        return [];
    }
}
