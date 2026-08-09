import type { AiCrawlerAgent } from "./robots-parser";
import type { PageSignals } from "./extract-page-signals";
import { isIdentityType, type SchemaValidationResult } from "./schema-validator";

/**
 * E-3 findings. F5.2 (crawlability), F5.3 (AI-bot access), and F5.4
 * (schema/JSON-LD) are observed directly by the crawl itself. F5.8
 * (answerability) and F5.12's full severity-plus-affected-prompts model are
 * separate, larger analysis passes — F5.12's linkage lives in
 * finding-prompt-linkage.ts, computed from these findings plus citation data
 * the crawl itself never sees.
 */
export type CrawlFindingSeverity = "critical" | "high" | "medium" | "low";

export type CrawlFindingRule =
    | "ai_bot_blocked"
    | "robots_txt_unreachable"
    | "http_error"
    | "missing_canonical"
    | "thin_content"
    | "invalid_json_ld"
    | "missing_structured_data"
    | "incomplete_schema"
    | "duplicate_conflicting_schema";

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

/**
 * F5.4 findings for one page's JSON-LD.
 *
 * `missing_structured_data` fires ONLY on the homepage, and only when it
 * carries no LocalBusiness/Organization entity at all — flagging every page
 * on a site for lacking JSON-LD would be exactly the "simply check whether
 * JSON-LD exists" blanket noise the spec warns against. A blog post with no
 * schema is normal; a local business's homepage with no identity markup at
 * all is a real, specific gap.
 */
export function schemaFindings(
    url: string,
    validation: SchemaValidationResult,
    isHomepage: boolean
): CrawlFinding[] {
    const findings: CrawlFinding[] = [];

    for (const parseError of validation.parseErrors) {
        findings.push({
            rule: "invalid_json_ld",
            severity: "medium",
            pageUrl: url,
            evidence: `A JSON-LD block on this page is not valid JSON: ${parseError}`,
            fixInstruction: "Fix the malformed JSON-LD block. Invalid JSON is silently ignored by every consumer, so this structured data currently contributes nothing.",
        });
    }

    for (const field of validation.fieldFindings) {
        const isIdentity = isIdentityType(field.entityType);
        findings.push({
            rule: "incomplete_schema",
            severity: isIdentity ? "medium" : "low",
            pageUrl: url,
            evidence: `${field.entityType} structured data is missing the required "${field.field}" property`,
            fixInstruction: `Add "${field.field}" to the ${field.entityType} JSON-LD block on this page.`,
        });
    }

    for (const conflict of validation.conflictingIdentities) {
        findings.push({
            rule: "duplicate_conflicting_schema",
            severity: "medium",
            pageUrl: url,
            evidence: `Multiple ${conflict.entityType} blocks on this page disagree on identity: ${conflict.labels.join(" vs. ")}`,
            fixInstruction: `Keep a single, consistent ${conflict.entityType} block per page — conflicting identity markup is a confusing signal to anything reading it.`,
        });
    }

    if (isHomepage) {
        const hasIdentity = validation.entitiesFound.some((e) => isIdentityType(e.type));
        if (!hasIdentity) {
            findings.push({
                rule: "missing_structured_data",
                severity: "high",
                pageUrl: url,
                evidence: "The homepage has no LocalBusiness or Organization structured data",
                fixInstruction: "Add a LocalBusiness JSON-LD block to the homepage with at least name and address — this is the primary way AI systems confirm what business a page belongs to.",
            });
        }
    }

    return findings;
}
