import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { logger } from "@/lib/logger";
import type { CrawlSiteResult } from "./crawl-site";
import type { CrawlFinding } from "./crawl-findings";

type Admin = SupabaseClient<Database>;

export const AEO_CRAWL_PAGES_BUCKET = "aeo-crawl-pages";

/**
 * E-3: persists one crawlSite() result. Mirrors E-8's SupabaseAnswerStore —
 * raw HTML goes to Storage first, the pointer (or null on a failed upload)
 * goes in the row, and a storage failure never loses the observation itself.
 */
export class SupabaseCrawlStore {
    private readonly db: Admin;

    constructor(db: Admin) {
        this.db = db;
    }

    async createRun(input: {
        businessId: string;
        origin: string;
        trigger: "manual" | "scheduled";
        pageCap: number;
    }): Promise<{ runId: string }> {
        const { data, error } = await this.db
            .from("crawl_runs")
            .insert({
                business_id: input.businessId,
                status: "running",
                trigger: input.trigger,
                origin: input.origin,
                page_cap: input.pageCap,
                pages_discovered: 0,
                pages_crawled: 0,
            })
            .select("id")
            .single();

        if (error) throw new Error(`crawl_runs insert failed: ${error.message}`);
        return { runId: data.id };
    }

    /** Uploads one page's raw HTML. Returns null (never throws) on failure — same contract as AnswerStore.put. */
    private async storeHtml(input: {
        organizationId: string;
        runId: string;
        pageId: string;
        html: string;
    }): Promise<string | null> {
        const path = `${input.organizationId}/${input.runId}/${input.pageId}.html`;
        const { error } = await this.db.storage
            .from(AEO_CRAWL_PAGES_BUCKET)
            .upload(path, new Blob([input.html], { type: "text/html" }), {
                contentType: "text/html",
                upsert: true,
            });

        if (error) {
            logger.error({ err: error, path }, "[AEO crawler] page HTML upload failed; storing no evidence");
            return null;
        }
        return path;
    }

    /**
     * Persists every crawled page and finding for a run, then closes it.
     * Sequential per page (not Promise.all) so politeness already paced the
     * FETCHES; there is no reason to fire a burst of storage uploads either.
     */
    async persistAndComplete(input: {
        runId: string;
        businessId: string;
        organizationId: string;
        result: CrawlSiteResult;
    }): Promise<void> {
        const pageIdByUrl = new Map<string, string>();

        for (const page of input.result.pages) {
            const { data, error } = await this.db
                .from("crawl_pages")
                .insert({
                    crawl_run_id: input.runId,
                    business_id: input.businessId,
                    url: page.url,
                    http_status: page.httpStatus,
                    fetch_error: page.fetchError,
                    canonical_url: page.signals?.canonicalUrl ?? null,
                    meta_robots: page.signals?.metaRobots ?? null,
                    title: page.signals?.title ?? null,
                    h1_count: page.signals?.h1Count ?? null,
                    word_count: page.signals?.wordCount ?? null,
                    content_storage_path: null,
                })
                .select("id")
                .single();

            if (error) throw new Error(`crawl_pages insert failed: ${error.message}`);
            pageIdByUrl.set(page.url, data.id);

            if (page.html) {
                const path = await this.storeHtml({
                    organizationId: input.organizationId,
                    runId: input.runId,
                    pageId: data.id,
                    html: page.html,
                });
                if (path) {
                    await this.db.from("crawl_pages").update({ content_storage_path: path }).eq("id", data.id);
                }
            }
        }

        if (input.result.findings.length > 0) {
            const { error } = await this.db.from("crawl_findings").insert(
                input.result.findings.map((f: CrawlFinding) => ({
                    crawl_run_id: input.runId,
                    crawl_page_id: f.pageUrl ? (pageIdByUrl.get(f.pageUrl) ?? null) : null,
                    business_id: input.businessId,
                    rule: f.rule,
                    severity: f.severity,
                    page_url: f.pageUrl,
                    evidence: f.evidence,
                    fix_instruction: f.fixInstruction,
                }))
            );
            if (error) throw new Error(`crawl_findings insert failed: ${error.message}`);
        }

        const { error } = await this.db
            .from("crawl_runs")
            .update({
                status: "success",
                pages_discovered: input.result.coverage.discovered,
                pages_crawled: input.result.coverage.crawled,
                completed_at: new Date().toISOString(),
            })
            .eq("id", input.runId);

        if (error) throw new Error(`crawl_runs completion update failed: ${error.message}`);
    }

    async failRun(runId: string, errorMessage: string): Promise<void> {
        await this.db
            .from("crawl_runs")
            .update({ status: "failed", error_message: errorMessage, completed_at: new Date().toISOString() })
            .eq("id", runId);
    }
}
