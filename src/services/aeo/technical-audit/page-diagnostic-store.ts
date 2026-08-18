import type { SupabaseClient } from "@supabase/supabase-js";

export class PageDiagnosticStore {
    constructor(private readonly db: SupabaseClient) {}

    async loadRawHtml(pageId: string): Promise<string | null> {
        const page = await this.db.from("crawl_pages").select("content_storage_path").eq("id", pageId).single();
        if (page.error) throw new Error(`load crawl page: ${page.error.message}`);
        if (!page.data.content_storage_path) return null;
        const object = await this.db.storage.from("aeo-crawl-pages").download(page.data.content_storage_path);
        if (object.error) throw new Error(`download crawl evidence: ${object.error.message}`);
        return object.data.text();
    }

    async persist(input: {
        businessId: string;
        pageId: string;
        url: string;
        render: { rawTextHash: string; renderedTextHash: string; jsOnlyWordCount: number; jsDeltaRatio: number } | null;
        speed: { lcpMs: number | null; cls: number | null; inpMs: number | null; performanceScore: number | null; sourcePayload: Record<string, unknown> } | null;
        index: { status: string; verdict: string; payload: Record<string, unknown> } | null;
    }): Promise<void> {
        const result = await this.db.from("aeo_page_diagnostics").insert({
            business_id: input.businessId,
            crawl_page_id: input.pageId,
            url: input.url,
            raw_text_hash: input.render?.rawTextHash ?? null,
            rendered_text_hash: input.render?.renderedTextHash ?? null,
            js_only_word_count: input.render?.jsOnlyWordCount ?? null,
            js_delta_ratio: input.render?.jsDeltaRatio ?? null,
            lcp_ms: input.speed?.lcpMs ?? null,
            cls: input.speed?.cls ?? null,
            inp_ms: input.speed?.inpMs ?? null,
            performance_score: input.speed?.performanceScore ?? null,
            index_status: input.index?.status ?? "not_checked",
            index_verdict: input.index?.verdict ?? null,
            source_payload: { pagespeed: input.speed?.sourcePayload ?? null, inspection: input.index?.payload ?? null },
        });
        if (result.error) throw new Error(`persist page diagnostics: ${result.error.message}`);
    }
}
