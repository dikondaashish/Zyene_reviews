import { inngest } from "@/services/inngest/client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { logger } from "@/lib/logger";
import { isLiveCrawlingEnabled } from "@/lib/features/aeo-surfaces";
import { crawlSite, CRAWLER_USER_AGENT } from "@/services/aeo/crawler/crawl-site";
import { PolitenessQueue } from "@/services/aeo/crawler/politeness-queue";
import { pageCapForPlan } from "@/services/aeo/crawler/crawl-plan-budget";
import { SupabaseCrawlStore } from "@/services/aeo/crawler/supabase-crawl-store";
import { checkOriginIsPublic } from "@/services/aeo/crawler/ssrf-guard";
import { createCrawlFetch } from "@/services/aeo/crawler/safe-fetch";

/**
 * Built per crawl rather than shared at module scope: the per-host SSRF verdict
 * cache inside it should not outlive one run.
 */
function buildFetchText() {
    return createCrawlFetch({ userAgent: CRAWLER_USER_AGENT });
}

/**
 * E-3 automation: one business's scheduled crawl.
 *
 * `crawlSite()` deliberately runs OUTSIDE `step.run` here, unlike every other
 * AEO worker's per-unit-of-work pattern. A Professional-plan crawl can carry
 * up to 1,000 pages of raw HTML in its result; memoizing that as one step's
 * output risks the Inngest step-output size limit before this ever reaches
 * the DB. Only the DB write is memoized. The real cost of that tradeoff: a
 * crash between crawl and persist re-runs the ENTIRE crawl on retry — extra
 * load against a site we do not control, not just extra compute here. Worth
 * revisiting (e.g. persisting page-by-page as the crawl progresses) before
 * this is ever pointed at a Professional-tier site with real page counts;
 * flagged, not silently accepted.
 */
export const aeoCrawlWorker = inngest.createFunction(
    {
        id: "aeo-crawl-worker",
        concurrency: { key: "event.data.businessId", limit: 1 },
        retries: 1,
    },
    { event: "aeo/crawl.requested" },
    async ({ event, step }) => {
        if (!isLiveCrawlingEnabled()) {
            return { skipped: "live_crawling_disabled" as const };
        }

        const { businessId, organizationId, origin, planId, trigger } = event.data;
        const store = new SupabaseCrawlStore(createAdminClient());

        const { runId } = await step.run("create-run", () =>
            store.createRun({ businessId, origin, trigger, pageCap: pageCapForPlan(planId) })
        );

        // `origin` is businesses.website — tenant-controlled data, not a value
        // this app chose. Checked here, the one place every trigger path
        // (manual and scheduled) is guaranteed to pass through, rather than
        // relying on every future caller to remember to check it themselves.
        const safety = await step.run("check-origin-safety", () => checkOriginIsPublic(origin));
        if (!safety.safe) {
            logger.warn({ businessId, runId, origin, reason: safety.reason }, "[AEO crawler] refused unsafe origin");
            await step.run("fail-run-unsafe-origin", () => store.failRun(runId, `Refused: ${safety.reason}`));
            return { runId, skipped: "unsafe_origin" as const, reason: safety.reason };
        }

        try {
            const result = await crawlSite(
                { origin, planId },
                { fetchText: buildFetchText(), politeness: new PolitenessQueue() }
            );

            await step.run("persist-and-complete", () =>
                store.persistAndComplete({ runId, businessId, organizationId, result })
            );

            return {
                runId,
                pagesCrawled: result.coverage.crawled,
                pagesDiscovered: result.coverage.discovered,
                findings: result.findings.length,
            };
        } catch (error) {
            logger.error({ err: error, businessId, runId }, "[AEO crawler] scheduled crawl failed");
            await step.run("fail-run", () =>
                store.failRun(runId, error instanceof Error ? error.message : String(error))
            );
            throw error;
        }
    }
);
