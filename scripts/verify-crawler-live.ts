/**
 * E-3: runs ONE real crawl against a real site and prints what it found.
 *
 * Crawl-only, no persistence — 20260809170000_aeo_crawler_schema.sql is
 * designed and dry-run verified but not applied, so there is nowhere to
 * write yet. This proves crawlSite() works end-to-end against a real,
 * live site's real robots.txt, real sitemap, and real page markup.
 *
 *   pnpm exec tsx scripts/verify-crawler-live.ts <origin>
 *
 * Real HTTP requests against whatever origin you pass. Confirmed with the
 * user before running against wolfpackkc.com specifically — this script
 * makes no default target, so it cannot accidentally crawl anyone.
 */
import { crawlSite, CRAWLER_USER_AGENT } from "../src/services/aeo/crawler/crawl-site";
import { PolitenessQueue } from "../src/services/aeo/crawler/politeness-queue";
import type { FetchText } from "../src/services/aeo/crawler/discover-urls";

const origin = process.argv[2];
if (!origin) {
    console.error("Usage: pnpm exec tsx scripts/verify-crawler-live.ts <origin>");
    process.exit(1);
}

const fetchText: FetchText = async (url) => {
    try {
        const res = await fetch(url, { headers: { "User-Agent": CRAWLER_USER_AGENT } });
        return { ok: res.ok, status: res.status, text: await res.text() };
    } catch {
        return null;
    }
};

async function main() {
    console.log(`Crawling ${origin} as "${CRAWLER_USER_AGENT}"\n`);

    const started = Date.now();
    const result = await crawlSite(
        { origin, planId: "starter_monthly" },
        { fetchText, politeness: new PolitenessQueue(1000) }
    );
    const elapsedS = ((Date.now() - started) / 1000).toFixed(1);

    console.log(`Coverage : ${result.coverage.crawled}/${result.coverage.discovered} pages` +
        (result.coverage.cappedAt ? ` (capped at ${result.coverage.cappedAt})` : "") +
        ` — ${elapsedS}s wall time (≤1 req/s politeness)\n`);

    for (const page of result.pages) {
        const status = page.httpStatus ?? `ERROR: ${page.fetchError}`;
        console.log(
            `${String(status).padEnd(20)} ${page.url}` +
                (page.signals
                    ? `\n  title="${page.signals.title ?? "—"}" canonical=${page.signals.canonicalUrl ?? "—"} h1=${page.signals.h1Count} words=${page.signals.wordCount}`
                    : "")
        );
    }

    console.log(`\nFindings (${result.findings.length}):`);
    for (const f of result.findings) {
        console.log(`  [${f.severity.toUpperCase()}] ${f.rule}${f.pageUrl ? ` @ ${f.pageUrl}` : ""}`);
        console.log(`    evidence: ${f.evidence}`);
    }
    if (result.findings.length === 0) console.log("  (none)");
}

main().catch((err) => {
    console.error("CRAWL FAILED:", err);
    process.exit(1);
});
