import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "supabase/migrations", name), "utf8");
const statusMigration = read("20261020120000_campaign_status_draft_and_active.sql");
const statsMigration = read("20261020121000_campaign_stats_trigger.sql");

describe("campaign status migration", () => {
    it("allows every status the campaign API schema accepts", () => {
        const check = statusMigration.match(/CHECK \(status IN \(([^)]*)\)\)/)?.[1] ?? "";
        for (const status of ["draft", "active", "paused", "processing", "completed", "archived"]) {
            expect(check).toContain(`'${status}'`);
        }
    });

    it("moves campaigns stuck in processing back to active", () => {
        expect(statusMigration).toMatch(/UPDATE public\.campaigns SET status = 'active' WHERE status = 'processing'/);
    });
});

describe("campaign stats trigger migration", () => {
    it("recomputes all funnel counters from review_requests", () => {
        for (const column of ["total_sent", "total_opened", "total_clicked", "total_completed"]) {
            expect(statsMigration).toContain(`${column} `);
        }
        expect(statsMigration).toMatch(/FROM public\.review_requests rr\s+WHERE rr\.campaign_id = p_campaign_id/);
    });

    it("fires on insert, delete and funnel-field updates, and backfills", () => {
        expect(statsMigration).toMatch(/AFTER INSERT OR DELETE OR UPDATE OF campaign_id, status, sent_at, opened_at, clicked_at, completed_at, review_left/);
        expect(statsMigration).toMatch(/SELECT public\.refresh_campaign_stats\(id\) FROM public\.campaigns/);
    });

    it("pins search_path and keeps the definer functions off client roles", () => {
        expect(statsMigration.match(/SECURITY DEFINER\s+SET search_path = public, pg_temp/g)).toHaveLength(2);
        expect(statsMigration).toContain("REVOKE ALL ON FUNCTION public.refresh_campaign_stats(uuid) FROM PUBLIC, anon, authenticated");
        expect(statsMigration).toContain("REVOKE ALL ON FUNCTION public.review_requests_refresh_campaign_stats() FROM PUBLIC, anon, authenticated");
    });
});
