import { describe, expect, it } from "vitest";
import { identifyAiCrawler, normalizeCrawlerLog } from "../../src/services/aeo/crawler-logs/normalize-log";

describe("AI crawler log ingestion", () => {
    it.each([
        ["Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)", "GPTBot"],
        ["ClaudeBot/1.0", "ClaudeBot"],
        ["PerplexityBot/1.0", "PerplexityBot"],
        ["Google-Extended", "Google-Extended"],
    ])("identifies %s", (userAgent, expected) => {
        expect(identifyAiCrawler(userAgent)).toBe(expected);
    });

    it("drops normal visitors instead of inflating crawler counts", () => {
        expect(normalizeCrawlerLog({ timestamp: "2026-08-18T12:00:00Z", method: "GET", path: "/", status: 200, userAgent: "Chrome" })).toBeNull();
    });
});
