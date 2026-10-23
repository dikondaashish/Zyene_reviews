/**
 * Pure helpers behind the dashboard's small charts. Owners skim the home page,
 * so numbers that used to sit in sentences are drawn as bars, rings and gauges;
 * these functions keep the maths testable and out of the components.
 */

export type Tone = "good" | "ok" | "bad" | "none";

/** Same thresholds the cards already used for coloured text: 80+ good, 40+ ok. */
export function scoreTone(score: number | null): Tone {
    if (score === null || !Number.isFinite(score)) return "none";
    return score >= 80 ? "good" : score >= 40 ? "ok" : "bad";
}

export function clampPct(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.min(100, Math.max(0, value));
}

export function isActNow(urgency: string): boolean {
    return urgency.toLowerCase().includes("now");
}

export type ListingAction = { key: "calls" | "directions" | "website"; label: string; count: number; widthPct: number };

/** Google listing funnel: views at the top, then what viewers did, sized against the biggest action. */
export function listingFunnel(perf: { profileViews: number; callClicks: number; directionRequests: number; websiteClicks: number }) {
    const raw = [
        { key: "calls" as const, label: "Calls", count: perf.callClicks },
        { key: "directions" as const, label: "Direction requests", count: perf.directionRequests },
        { key: "website" as const, label: "Website visits", count: perf.websiteClicks },
    ];
    const totalActions = raw.reduce((sum, a) => sum + a.count, 0);
    const biggest = Math.max(...raw.map((a) => a.count), 0);
    const actions: ListingAction[] = raw.map((a) => ({ ...a, widthPct: biggest > 0 ? Math.max(2, Math.round((a.count / biggest) * 100)) : 0 }));
    const actionRate = perf.profileViews > 0 ? (totalActions / perf.profileViews) * 100 : null;
    return { views: perf.profileViews, totalActions, actionRate, actions };
}

/** Theme bar width against the most-mentioned theme, never invisible. */
export function themeBarWidths(mentions: number[]): number[] {
    const max = Math.max(...mentions, 0);
    return mentions.map((m) => (max > 0 ? Math.max(6, Math.round((m / max) * 100)) : 6));
}

/**
 * Share of theme mentions that are positive. Null when there are no mentions,
 * so the ring is hidden rather than showing an invented number.
 */
export function positiveMentionPct(themes: Array<{ mentions: number; sentiment: string }>): number | null {
    const total = themes.reduce((sum, t) => sum + Math.max(0, t.mentions || 0), 0);
    if (total === 0) return null;
    const positive = themes
        .filter((t) => (t.sentiment || "").toLowerCase() === "positive")
        .reduce((sum, t) => sum + Math.max(0, t.mentions || 0), 0);
    return Math.round((positive / total) * 100);
}
