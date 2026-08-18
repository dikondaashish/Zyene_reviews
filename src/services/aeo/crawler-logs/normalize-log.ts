export const AI_CRAWLERS = ["ChatGPT-User", "GPTBot", "Claude-User", "ClaudeBot", "PerplexityBot", "Google-Extended", "CCBot"] as const;
export type AiCrawler = (typeof AI_CRAWLERS)[number];

export type IncomingCrawlerLog = {
    timestamp: string;
    method: string;
    path: string;
    status: number;
    userAgent: string;
    requestId?: string;
};

export function identifyAiCrawler(userAgent: string): AiCrawler | null {
    return AI_CRAWLERS.find((crawler) => userAgent.toLowerCase().includes(crawler.toLowerCase())) ?? null;
}

export function normalizeCrawlerLog(log: IncomingCrawlerLog): (IncomingCrawlerLog & { crawler: AiCrawler }) | null {
    const crawler = identifyAiCrawler(log.userAgent);
    if (!crawler) return null;
    return { ...log, crawler };
}
