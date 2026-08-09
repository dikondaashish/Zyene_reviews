import type { AiCrawlerAgent } from "./robots-parser";
import type { PageSignals } from "./extract-page-signals";

/**
 * E-3 findings — deliberately narrow. F5.2 (crawlability) and F5.3 (AI-bot
 * access) only; F5.4 (schema/JSON-LD), F5.8 (answerability), and F5.12's full
 * severity-plus-affected-prompts model are separate, larger analysis passes
 * left for later. Every rule here is something the crawl itself observes
 * directly, not something requiring a second pass over stored content.
 */
export type CrawlFindingSeverity = "critical" | "high" | "medium" | "low";

export type CrawlFindingRule =
    | "ai_bot_blocked"
    | "robots_txt_unreachable"
    | "http_error"
    | "missing_canonical"
    | "thin_content";

export type CrawlFinding = {
    rule: CrawlFindingRule;
    severity: CrawlFindingSeverity;
    /** Null for a run-level finding (e.g. robots.txt itself), set for a page-level one. */
    pageUrl: string | null;
    evidence: string;
    fixInstruction: string;
};

/** One finding per AI crawler robots.txt blocks at the site root — F5.3, run-level. */
export function aiBotBlockedFindings(blocked: readonly AiCrawlerAgent[]): CrawlFinding[] {
    return blocked.map((agent) => ({
        rule: "ai_bot_blocked",
        severity: "critical",
        pageUrl: null,
        evidence: `robots.txt disallows "${agent}" at the site root ("/")`,
        fixInstruction: `Add a "User-agent: ${agent}" group to robots.txt with "Allow: /" (or remove the rule blocking it) so ${agent} can read this site.`,
    }));
}

/**
 * robots.txt itself could not be read. Per the plan doc's own edge case: do
 * NOT assume allow when this happens — report the uncertainty explicitly
 * rather than silently treating an unreachable robots.txt as "nothing is
 * blocked".
 */
export function robotsUnreachableFinding(reason: string): CrawlFinding {
    return {
        rule: "robots_txt_unreachable",
        severity: "medium",
        pageUrl: null,
        evidence: `robots.txt could not be read: ${reason}`,
        fixInstruction: "Confirm robots.txt is reachable and returns 200. Until it is, AI-crawler access here is unknown, not assumed open.",
    };
}

/** Findings this crawl directly observed while fetching one page — never claims what it did not see. */
export function pageLevelFindings(url: string, httpStatus: number | null, signals: PageSignals | null): CrawlFinding[] {
    const findings: CrawlFinding[] = [];

    if (httpStatus !== null && httpStatus >= 400) {
        findings.push({
            rule: "http_error",
            severity: httpStatus >= 500 ? "high" : "medium",
            pageUrl: url,
            evidence: `HTTP ${httpStatus}`,
            fixInstruction:
                httpStatus >= 500
                    ? "The server errored on this page. Fix the underlying error so both users and AI crawlers can read it."
                    : "This page returned a client error. If it should exist, fix the broken link or route; if not, remove it from the sitemap.",
        });
        // A page that failed to load has no signals to evaluate further.
        return findings;
    }

    if (!signals) return findings;

    if (!signals.canonicalUrl) {
        findings.push({
            rule: "missing_canonical",
            severity: "low",
            pageUrl: url,
            evidence: "No <link rel=\"canonical\"> tag found",
            fixInstruction: "Add a canonical tag pointing at this page's preferred URL, even if it is the page's own address.",
        });
    }

    // Hedged deliberately: low visible text after stripping scripts/styles is
    // consistent with content that only renders after JavaScript, which AI
    // crawlers largely do not execute (PRD-6's stated SPA edge case) — but a
    // short page can also just be a short page. This says "found", not "is".
    if (signals.wordCount < 20) {
        findings.push({
            rule: "thin_content",
            severity: "medium",
            pageUrl: url,
            evidence: `Only ${signals.wordCount} words of visible text found in the raw HTML`,
            fixInstruction:
                "If this page's real content renders via JavaScript, AI crawlers likely cannot read it — consider server-rendering the key content, or confirm this page is intentionally minimal.",
        });
    }

    return findings;
}
