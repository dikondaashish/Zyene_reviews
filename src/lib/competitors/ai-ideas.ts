/**
 * Shapes AI competitor insights for a scan-first layout: a few things worth
 * doing, then everything that only says "keep watching" folded into one line.
 * Owners skipped the old wall of identical "low priority, monitor" cards.
 */
export type AiInsightInput = {
    id: string;
    competitorId: string;
    competitorName: string;
    priority: string;
    summary: string;
    whyItMatters: string | null;
    ownerSuggestion: string | null;
    actions: Array<{ title?: string }>;
    recommendations: string[];
    confidence: number | null;
    createdAt: string;
};

export type AiIdea = AiInsightInput & {
    level: "high" | "medium" | "low";
    headline: string;
    /** The one step to show first; null when the AI gave none. */
    doThis: string | null;
    /** Everything else the AI suggested, for the folded detail. */
    moreSteps: string[];
};

/** First sentence only: the rest of an AI summary usually restates it. */
export function firstSentence(text: string): string {
    const trimmed = text.trim();
    const match = trimmed.match(/^.+?[.!?](?=\s|$)/);
    return (match ? match[0] : trimmed).trim();
}

function level(priority: string): AiIdea["level"] {
    const p = priority.trim().toLowerCase();
    return p === "high" ? "high" : p === "medium" ? "medium" : "low";
}

export function toAiIdea(input: AiInsightInput): AiIdea {
    const steps = [
        ...input.actions.map((a) => a.title?.trim() ?? ""),
        ...input.recommendations.map((r) => r.trim()),
    ].filter(Boolean);
    const unique = steps.filter((s, i) => steps.indexOf(s) === i);
    return { ...input, level: level(input.priority), headline: firstSentence(input.summary), doThis: unique[0] ?? null, moreSteps: unique.slice(1) };
}

const ORDER = { high: 0, medium: 1, low: 2 } as const;

export function groupAiIdeas(inputs: AiInsightInput[]): { actNow: AiIdea[]; noAction: AiIdea[] } {
    const ideas = inputs.map(toAiIdea).sort((a, b) => ORDER[a.level] - ORDER[b.level]);
    return { actNow: ideas.filter((i) => i.level !== "low"), noAction: ideas.filter((i) => i.level === "low") };
}

/** A brief older than this describes a market that has likely moved on. */
export const BRIEF_STALE_DAYS = 30;

export function briefAgeDays(createdAt: string, now: Date): number {
    return Math.floor((now.getTime() - Date.parse(createdAt)) / 86_400_000);
}
