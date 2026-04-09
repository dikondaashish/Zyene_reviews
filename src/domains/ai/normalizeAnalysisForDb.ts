const ALLOWED_SENTIMENT = new Set(["positive", "neutral", "negative", "mixed"]);

/**
 * Postgres CHECK on reviews.sentiment is case-sensitive; model output must match exactly.
 */
export function normalizeSentimentForDb(raw: unknown): string {
    const s = String(raw ?? "")
        .toLowerCase()
        .trim();
    if (ALLOWED_SENTIMENT.has(s)) return s;
    if (s.includes("pos")) return "positive";
    if (s.includes("neg")) return "negative";
    if (s.includes("mix")) return "mixed";
    return "neutral";
}

/** Postgres CHECK: urgency_score between 1 and 10 inclusive. */
export function normalizeUrgencyForDb(raw: unknown): number {
    const n = Number(raw);
    if (!Number.isFinite(n)) return 5;
    return Math.min(10, Math.max(1, Math.round(n)));
}

export function normalizeThemesForDb(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    return raw
        .map((t) =>
            String(t)
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "_")
        )
        .filter(Boolean);
}
