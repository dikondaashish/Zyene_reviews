/**
 * E-3 / F5.3: robots.txt, parsed enough to answer "can this agent fetch this
 * path" — the single check the plan doc calls the highest-impact AEO blocker
 * and "trivially checkable". Trivial to CHECK, not trivial to get right: this
 * is the one place a bug reads as "your site blocks GPTBot" to a customer who
 * never blocked anything, so the matching algorithm follows RFC 9309 rather
 * than a shortcut.
 *
 * Scope: standard User-agent/Allow/Disallow groups, `*` wildcard and `$`
 * end-anchor within a rule path, longest-match-wins with ties favouring
 * Allow. NOT scoped: Sitemap directives here (discover-urls.ts reads those
 * separately), Crawl-delay (Phase 1 politeness is a fixed ≤1 req/s regardless
 * of what a site asks for for other reasons — matching a slower request is
 * safe, matching a faster one is not, so a site's own Crawl-delay can only
 * ever widen our default, never narrow it, and nothing here does that yet).
 */

export type RobotsRule = { path: string; allow: boolean };

/** Agent names lowercased at parse time; lookups lowercase too, so matching is case-insensitive per spec. */
export type RobotsRules = ReadonlyMap<string, readonly RobotsRule[]>;

const WILDCARD_GROUP = "*";

/**
 * The agents F5.3 checks by name. Google-Extended and CCBot are trained-on
 * crawlers with no separate "fetch this page for the answer" bot — blocking
 * them affects training, not live retrieval — but the plan doc names them
 * explicitly as part of the audit, so they are checked the same way.
 */
export const AI_CRAWLER_AGENTS = [
    "GPTBot",
    "ClaudeBot",
    "PerplexityBot",
    "Google-Extended",
    "CCBot",
] as const;

export type AiCrawlerAgent = (typeof AI_CRAWLER_AGENTS)[number];

export function parseRobotsTxt(text: string): RobotsRules {
    const groups = new Map<string, RobotsRule[]>();
    let currentAgents: string[] = [];
    // A group is "open" while consecutive User-agent lines are still being
    // collected; the first non-agent directive closes it. Without this, a
    // Disallow immediately after one group's rules would incorrectly attach
    // to a NEW User-agent line that starts the next group.
    let groupOpen = false;

    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.split("#")[0]?.trim() ?? "";
        if (!line) continue;

        const colon = line.indexOf(":");
        if (colon === -1) continue;
        const field = line.slice(0, colon).trim().toLowerCase();
        const value = line.slice(colon + 1).trim();

        if (field === "user-agent") {
            const agent = value.toLowerCase();
            if (!groupOpen) currentAgents = [];
            groupOpen = true;
            currentAgents.push(agent);
            if (!groups.has(agent)) groups.set(agent, []);
            continue;
        }

        if (field === "allow" || field === "disallow") {
            groupOpen = false;
            if (currentAgents.length === 0 || value === undefined) continue;
            // Disallow with an empty value means "disallow nothing" per spec —
            // equivalent to Allow: / — not "disallow everything".
            const rule: RobotsRule = { path: value, allow: field === "allow" || value === "" };
            for (const agent of currentAgents) {
                groups.get(agent)?.push(rule);
            }
            continue;
        }
        // Sitemap, Crawl-delay, and anything else: not this module's concern.
    }

    return groups;
}

/** Converts a robots.txt path pattern (`*` wildcard, optional `$` anchor) into a RegExp. */
function ruleToRegExp(pattern: string): RegExp {
    const anchored = pattern.endsWith("$");
    const body = anchored ? pattern.slice(0, -1) : pattern;
    const escaped = body.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(`^${escaped}${anchored ? "$" : ""}`);
}

/**
 * Whether `userAgent` may fetch `path`, per the most specific matching group.
 *
 * Falls back to `*` when no group names this agent exactly. No rules at all
 * — empty robots.txt, or a 404 for it — means allowed, per spec: absence is
 * not a block.
 */
export function isPathAllowed(rules: RobotsRules, userAgent: string, path: string): boolean {
    const agent = userAgent.toLowerCase();
    const group = rules.get(agent) ?? rules.get(WILDCARD_GROUP);
    if (!group || group.length === 0) return true;

    let best: { length: number; allow: boolean } | null = null;
    for (const rule of group) {
        if (!ruleToRegExp(rule.path).test(path)) continue;
        // Longest match wins; a tie in length favours Allow (RFC 9309 §2.2.2).
        if (!best || rule.path.length > best.length || (rule.path.length === best.length && rule.allow)) {
            best = { length: rule.path.length, allow: rule.allow };
        }
    }
    return best ? best.allow : true;
}

/**
 * F5.3's actual output: which named AI crawlers this robots.txt blocks from
 * the site root. Root-level blocking is the practical, well-understood
 * signal tools in this space report — a site that disallows everything for
 * GPTBot at "/" is blocked in every sense that matters to this audit.
 */
export function findBlockedAiCrawlers(rules: RobotsRules): AiCrawlerAgent[] {
    return AI_CRAWLER_AGENTS.filter((agent) => !isPathAllowed(rules, agent, "/"));
}
