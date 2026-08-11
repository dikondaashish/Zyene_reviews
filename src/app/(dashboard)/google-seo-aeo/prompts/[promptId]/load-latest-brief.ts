import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";

export type LatestBrief = {
    id: string;
    targetPageUrl: string | null;
    hasOwningPage: boolean;
    editItems: Array<{ category: string; description: string }>;
    faqItems: Array<{ question: string; answer: string }>;
    faqJsonLd: string;
    faqHtml: string;
    schemaPatchJsonLd: string;
    schemaPatchHasPlaceholders: boolean;
    confidence: string;
    citedSourceCount: number;
    createdAt: string;
};

/** Most recent brief for this prompt, or null — never fabricated, never shown stale-labeled-as-fresh. */
export async function loadLatestBrief(
    db: SupabaseClient<Database>,
    businessId: string,
    promptId: string
): Promise<LatestBrief | null> {
    const { data } = await db
        .from("aeo_content_briefs")
        .select("*")
        .eq("business_id", businessId)
        .eq("prompt_id", promptId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!data) return null;

    return {
        id: data.id,
        targetPageUrl: data.target_page_url,
        hasOwningPage: data.has_owning_page,
        editItems: (data.edit_items ?? []) as LatestBrief["editItems"],
        faqItems: (data.faq_items ?? []) as LatestBrief["faqItems"],
        faqJsonLd: data.faq_json_ld,
        faqHtml: data.faq_html,
        schemaPatchJsonLd: data.schema_patch_json_ld,
        schemaPatchHasPlaceholders: data.schema_patch_has_placeholders,
        confidence: data.confidence,
        citedSourceCount: data.cited_source_count,
        createdAt: data.created_at,
    };
}
