import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { assertAeoQueriesSucceeded } from "@/services/aeo/query-results";

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
    createdLabel: string;
    rewriteBefore: string;
    rewriteAfter: string;
    reviewInsights: Array<{ theme: string; mentions: number; examples: string[] }>;
};

/** Most recent brief for this prompt, or null — never fabricated, never shown stale-labeled-as-fresh. */
export async function loadLatestBrief(
    db: SupabaseClient<Database>,
    businessId: string,
    promptId: string
): Promise<LatestBrief | null> {
    const result = await db
        .from("aeo_content_briefs")
        .select("*" as never)
        .eq("business_id", businessId)
        .eq("prompt_id", promptId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
    assertAeoQueriesSucceeded("Unable to load latest AEO content brief", result);
    const data = result.data;

    if (!data) return null;
    const row = data as unknown as Record<string, unknown>;

    return {
        id: String(row.id),
        targetPageUrl: row.target_page_url as string | null,
        hasOwningPage: Boolean(row.has_owning_page),
        editItems: (row.edit_items ?? []) as LatestBrief["editItems"],
        faqItems: (row.faq_items ?? []) as LatestBrief["faqItems"],
        faqJsonLd: String(row.faq_json_ld), faqHtml: String(row.faq_html),
        schemaPatchJsonLd: String(row.schema_patch_json_ld), schemaPatchHasPlaceholders: Boolean(row.schema_patch_has_placeholders),
        confidence: String(row.confidence), citedSourceCount: Number(row.cited_source_count), createdAt: String(row.created_at),
        createdLabel: new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(String(row.created_at))),
        rewriteBefore: String(row.rewrite_before ?? ""), rewriteAfter: String(row.rewrite_after ?? ""),
        reviewInsights: (row.review_insights ?? []) as LatestBrief["reviewInsights"],
    };
}
