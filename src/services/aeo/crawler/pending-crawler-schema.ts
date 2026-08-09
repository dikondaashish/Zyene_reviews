import type { Database } from "@/lib/db/supabase/database.types";

/**
 * `20260809170000_aeo_crawler_schema.sql` is designed and dry-run verified
 * against production (all constraints, all adversarial rejections, the
 * storage bucket config) but NOT YET APPLIED, so the generated `Database`
 * type does not know crawl_runs, crawl_pages, or crawl_findings.
 *
 * Delete this file and every cast to ExtendedDatabase the moment the
 * migration is applied and types are regenerated — same situation, same fix,
 * as billing/pending-schema.ts for the E-9 credit ledger.
 */

type CrawlRunRow = {
    id: string;
    business_id: string;
    status: "running" | "success" | "partial" | "failed";
    trigger: "manual" | "scheduled";
    origin: string;
    pages_discovered: number;
    pages_crawled: number;
    page_cap: number;
    error_message: string | null;
    started_at: string;
    completed_at: string | null;
};

type CrawlPageRow = {
    id: string;
    crawl_run_id: string;
    business_id: string;
    url: string;
    http_status: number | null;
    fetch_error: string | null;
    canonical_url: string | null;
    meta_robots: string | null;
    title: string | null;
    h1_count: number | null;
    word_count: number | null;
    content_storage_path: string | null;
    fetched_at: string;
};

type CrawlFindingRow = {
    id: string;
    crawl_run_id: string;
    crawl_page_id: string | null;
    business_id: string;
    rule: string;
    severity: "critical" | "high" | "medium" | "low";
    page_url: string | null;
    evidence: string;
    fix_instruction: string;
    created_at: string;
};

type CrawlRunInsert = Omit<CrawlRunRow, "id" | "started_at" | "completed_at" | "error_message"> & {
    id?: string;
    started_at?: string;
    completed_at?: string | null;
    error_message?: string | null;
};

type CrawlPageInsert = Omit<CrawlPageRow, "id" | "fetched_at"> & { id?: string; fetched_at?: string };

type CrawlFindingInsert = Omit<CrawlFindingRow, "id" | "created_at"> & { id?: string; created_at?: string };

export type ExtendedDatabase = Database & {
    public: {
        Tables: {
            crawl_runs: {
                Row: CrawlRunRow;
                Insert: CrawlRunInsert;
                Update: Partial<CrawlRunRow>;
                Relationships: [];
            };
            crawl_pages: {
                Row: CrawlPageRow;
                Insert: CrawlPageInsert;
                Update: Partial<CrawlPageRow>;
                Relationships: [];
            };
            crawl_findings: {
                Row: CrawlFindingRow;
                Insert: CrawlFindingInsert;
                Update: Partial<CrawlFindingRow>;
                Relationships: [];
            };
        };
    };
};
