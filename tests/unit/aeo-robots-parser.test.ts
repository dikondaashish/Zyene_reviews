import { describe, expect, it } from "vitest";

import {
    findBlockedAiCrawlers,
    isPathAllowed,
    parseRobotsTxt,
} from "../../src/services/aeo/crawler/robots-parser";

describe("parseRobotsTxt — the ordinary shapes", () => {
    it("a wildcard group applies to any agent not named specifically", () => {
        const rules = parseRobotsTxt("User-agent: *\nDisallow: /admin/\n");
        expect(isPathAllowed(rules, "Googlebot", "/admin/panel")).toBe(false);
        expect(isPathAllowed(rules, "Googlebot", "/")).toBe(true);
    });

    it("a named group overrides the wildcard for that agent only", () => {
        const rules = parseRobotsTxt(
            "User-agent: *\nDisallow: /private/\n\nUser-agent: GPTBot\nDisallow: /\n"
        );
        expect(isPathAllowed(rules, "GPTBot", "/")).toBe(false);
        expect(isPathAllowed(rules, "Googlebot", "/")).toBe(true);
        expect(isPathAllowed(rules, "Googlebot", "/private/x")).toBe(false);
    });

    it("no robots.txt content at all means everything is allowed — absence is not a block", () => {
        const rules = parseRobotsTxt("");
        expect(isPathAllowed(rules, "GPTBot", "/")).toBe(true);
        expect(findBlockedAiCrawlers(rules)).toEqual([]);
    });

    it("comments and blank lines are ignored", () => {
        const rules = parseRobotsTxt(
            "# top comment\nUser-agent: *\n\n# mid comment\nDisallow: /x  # inline comment\n"
        );
        expect(isPathAllowed(rules, "Googlebot", "/x")).toBe(false);
        expect(isPathAllowed(rules, "Googlebot", "/y")).toBe(true);
    });

    it("matching is case-insensitive on agent name", () => {
        const rules = parseRobotsTxt("User-agent: gptbot\nDisallow: /\n");
        expect(isPathAllowed(rules, "GPTBot", "/")).toBe(false);
    });

    it("multiple consecutive User-agent lines share the rules that follow", () => {
        const rules = parseRobotsTxt(
            "User-agent: GPTBot\nUser-agent: ClaudeBot\nDisallow: /\n"
        );
        expect(isPathAllowed(rules, "GPTBot", "/")).toBe(false);
        expect(isPathAllowed(rules, "ClaudeBot", "/")).toBe(false);
        expect(isPathAllowed(rules, "PerplexityBot", "/")).toBe(true);
    });
});

describe("parseRobotsTxt — matching precision (false positives are the dangerous kind)", () => {
    it("longest match wins regardless of which rule appears first", () => {
        const rules = parseRobotsTxt("User-agent: *\nDisallow: /\nAllow: /blog/\n");
        expect(isPathAllowed(rules, "Googlebot", "/blog/post-1")).toBe(true);
        expect(isPathAllowed(rules, "Googlebot", "/other")).toBe(false);
    });

    it("a tie in match length favours Allow, per RFC 9309", () => {
        const rules = parseRobotsTxt("User-agent: *\nDisallow: /page\nAllow: /page\n");
        expect(isPathAllowed(rules, "Googlebot", "/page")).toBe(true);
    });

    it("an empty Disallow value means allow everything, not block everything", () => {
        const rules = parseRobotsTxt("User-agent: *\nDisallow:\n");
        expect(isPathAllowed(rules, "Googlebot", "/anything")).toBe(true);
    });

    it("a wildcard within a path only matches within that segment shape, not any substring", () => {
        const rules = parseRobotsTxt("User-agent: *\nDisallow: /search*/results\n");
        expect(isPathAllowed(rules, "Googlebot", "/search/foo/results")).toBe(false);
        expect(isPathAllowed(rules, "Googlebot", "/searching")).toBe(true);
    });

    it("a $ anchor requires the match to end exactly there", () => {
        const rules = parseRobotsTxt("User-agent: *\nDisallow: /file.pdf$\n");
        expect(isPathAllowed(rules, "Googlebot", "/file.pdf")).toBe(false);
        expect(isPathAllowed(rules, "Googlebot", "/file.pdf.bak")).toBe(true);
    });

    it("disallowing a subpath must not block the site root", () => {
        // The exact false-positive shape a naive substring check would produce.
        const rules = parseRobotsTxt("User-agent: GPTBot\nDisallow: /private/\n");
        expect(isPathAllowed(rules, "GPTBot", "/")).toBe(true);
        expect(findBlockedAiCrawlers(rules)).toEqual([]);
    });
});

describe("findBlockedAiCrawlers — F5.3's actual output", () => {
    it("names exactly the agents blocked at the root, not agents merely restricted somewhere", () => {
        const rules = parseRobotsTxt(
            "User-agent: GPTBot\nDisallow: /\n\n" +
                "User-agent: ClaudeBot\nDisallow: /admin/\n\n" +
                "User-agent: *\nAllow: /\n"
        );
        expect(findBlockedAiCrawlers(rules)).toEqual(["GPTBot"]);
    });

    it("a wildcard block at root catches every named AI crawler that has no override", () => {
        const rules = parseRobotsTxt("User-agent: *\nDisallow: /\n");
        expect(findBlockedAiCrawlers(rules)).toEqual([
            "GPTBot",
            "ClaudeBot",
            "PerplexityBot",
            "Google-Extended",
            "CCBot",
        ]);
    });

    it("a named override re-allows one agent even under a wildcard block", () => {
        const rules = parseRobotsTxt(
            "User-agent: *\nDisallow: /\n\nUser-agent: GPTBot\nAllow: /\n"
        );
        expect(findBlockedAiCrawlers(rules)).toEqual([
            "ClaudeBot",
            "PerplexityBot",
            "Google-Extended",
            "CCBot",
        ]);
    });

    it("a normal, unblocked site reports no blocked crawlers", () => {
        const rules = parseRobotsTxt(
            "User-agent: *\nDisallow: /wp-admin/\nDisallow: /cgi-bin/\nSitemap: https://example.com/sitemap.xml\n"
        );
        expect(findBlockedAiCrawlers(rules)).toEqual([]);
    });
});
