import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/supabase/database.types";
import { AEO_CRAWL_PAGES_BUCKET } from "../crawler/supabase-crawl-store";

type Admin = SupabaseClient<Database>;

export type PersistBriefInput = {
    businessId: string;
    promptId: string;
    targetPageUrl: string | null;
    hasOwningPage: boolean;
    editItems: Array<{ category: string; description: string }>;
    faqItems: Array<{ question: string; answer: string }>;
    faqJsonLd: string;
    faqHtml: string;
    schemaPatchJsonLd: string;
    schemaPatchHasPlaceholders: boolean;
    confidence: "high" | "low";
    citedSourceCount: number;
    rewriteBefore: string;
    rewriteAfter: string;
    reviewInsights: unknown[];
};

/** Reads through the caller's admin client — generation is server-action-gated, not client-writable. */
export class SupabaseBriefStore {
    constructor(private readonly db: Admin) {}

    async persist(input: PersistBriefInput): Promise<{ id: string }> {
        const { data, error } = await this.db
            .from("aeo_content_briefs")
            .insert({
                business_id: input.businessId,
                prompt_id: input.promptId,
                target_page_url: input.targetPageUrl,
                has_owning_page: input.hasOwningPage,
                edit_items: input.editItems as unknown as Json,
                faq_items: input.faqItems as unknown as Json,
                faq_json_ld: input.faqJsonLd,
                faq_html: input.faqHtml,
                schema_patch_json_ld: input.schemaPatchJsonLd,
                schema_patch_has_placeholders: input.schemaPatchHasPlaceholders,
                confidence: input.confidence,
                cited_source_count: input.citedSourceCount,
                rewrite_before: input.rewriteBefore,
                rewrite_after: input.rewriteAfter,
                review_insights: input.reviewInsights as unknown as Json,
            })
            .select("id")
            .single();

        if (error) throw new Error(`aeo_content_briefs insert failed: ${error.message}`);
        return { id: data.id };
    }

    /** The stored raw HTML for one crawled page, or null if it was never retained (storage failure, or the page fetch itself failed). */
    async loadPageHtml(storagePath: string): Promise<string | null> {
        const { data, error } = await this.db.storage.from(AEO_CRAWL_PAGES_BUCKET).download(storagePath);
        if (error || !data) return null;
        return data.text();
    }
}
