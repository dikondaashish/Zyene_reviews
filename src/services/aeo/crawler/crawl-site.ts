import { parseRobotsTxt, findBlockedAiCrawlers, isPathAllowed } from "./robots-parser";
import { discoverUrlsViaSitemap, discoverUrlsViaLinks, type FetchText } from "./discover-urls";
import { extractPageSignals, type PageSignals } from "./extract-page-signals";
import { aiBotBlockedFindings, robotsUnreachableFinding, pageLevelFindings, schemaFindings, type CrawlFinding } from "./crawl-findings";
import { answerabilityFindings } from "./answerability-findings";
import { validateSchemaBlocks } from "./schema-validator";
import { computeAnswerabilitySignals } from "./answerability";
import { pageCapForPlan, applyPageCap, type CrawlCoverage } from "./crawl-plan-budget";
import type { PolitenessQueue } from "./politeness-queue";

/** The user-agent this crawler identifies itself as — real, so a site owner can see and block it. */
export const CRAWLER_USER_AGENT = "ZyeneReviewsBot/1.0 (+https://zyenereviews.com/bot)";

export type CrawlSiteDeps = {
    fetchText: FetchText;
    politeness: PolitenessQueue;
};

export type CrawledPage = {
    url: string;
    httpStatus: number | null;
    fetchError: string | null;
    signals: PageSignals | null;
    /** Verbatim, only when the fetch succeeded — the persistence layer's evidence, not this module's concern where it ends up. */
    html: string | null;
};

export type CrawlSiteResult = {
    pages: CrawledPage[];
    findings: CrawlFinding[];
    coverage: CrawlCoverage;
};

function hostOf(url: string): string {
    return new URL(url).host;
}

async function politeFetch(url: string, deps: CrawlSiteDeps) {
    await deps.politeness.waitForTurn(hostOf(url));
    return deps.fetchText(url);
}

/**
 * E-3: one full crawl of one business's site.
 *
 * Order matters: robots.txt is read BEFORE any page is fetched, both for the
 * F5.3 finding and so our own crawler respects the same disallow rules it is
 * auditing — a crawler that only checks robots.txt for AI bots while ignoring
 * it for itself would be exactly the bad web citizenship this module exists
 * to avoid being.
 */
export async function crawlSite(
    input: { origin: string; planId: string | null },
    deps: CrawlSiteDeps
): Promise<CrawlSiteResult> {
    const findings: CrawlFinding[] = [];

    const robotsUrl = new URL("/robots.txt", input.origin).toString();
    const robotsResponse = await politeFetch(robotsUrl, deps);

    let robotsRules = parseRobotsTxt("");
    if (!robotsResponse) {
        findings.push(robotsUnreachableFinding("request failed"));
    } else if (!robotsResponse.ok) {
        // A 404 for robots.txt is normal and means "no restrictions" per spec.
        // Anything else unreachable (5xx) is the "do not assume allow" case.
        if (robotsResponse.status !== 404) {
            findings.push(robotsUnreachableFinding(`HTTP ${robotsResponse.status}`));
        }
    } else {
        robotsRules = parseRobotsTxt(robotsResponse.text);
    }

    findings.push(...aiBotBlockedFindings(findBlockedAiCrawlers(robotsRules)));

    const sitemapUrls = await discoverUrlsViaSitemap(input.origin, (url) => politeFetch(url, deps));
    const discovered =
        sitemapUrls ??
        (await discoverUrlsViaLinks(input.origin, (url) => politeFetch(url, deps)));

    const { urls: toCrawl, coverage } = applyPageCap(discovered, pageCapForPlan(input.planId));

    const pages: CrawledPage[] = [];
    for (const url of toCrawl) {
        // Our own crawler honours the SAME rules it is checking for AI agents,
        // under its own identifiable user-agent — never a path a site owner
        // disallowed for everyone.
        if (!isPathAllowed(robotsRules, CRAWLER_USER_AGENT, new URL(url).pathname)) {
            continue;
        }

        const response = await politeFetch(url, deps);
        if (!response) {
            pages.push({ url, httpStatus: null, fetchError: "request failed", signals: null, html: null });
            findings.push(...pageLevelFindings(url, null, null));
            continue;
        }

        const signals = response.ok ? extractPageSignals(response.text) : null;
        pages.push({
            url,
            httpStatus: response.status,
            fetchError: null,
            signals,
            html: response.ok ? response.text : null,
        });
        findings.push(...pageLevelFindings(url, response.status, signals));

        // F5.4 and F5.8, alongside F5.2's page-level checks — same page, same
        // fetch, no second pass over stored content.
        if (response.ok && signals) {
            const isHomepage = new URL(url).pathname === "/";
            const validation = validateSchemaBlocks(response.text);
            findings.push(...schemaFindings(url, validation, isHomepage));

            const isArticleType = validation.entitiesFound.some(
                (e) => e.type === "Article" || e.type === "BlogPosting"
            );
            findings.push(
                ...answerabilityFindings(url, computeAnswerabilitySignals(response.text), signals.wordCount, isArticleType)
            );
        }
    }

    return { pages, findings, coverage };
}
