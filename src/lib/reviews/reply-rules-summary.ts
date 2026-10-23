/**
 * Plain-language summary of per-star reply rules, e.g.
 * ["1–3★ wait for your approval", "4–5★ get an AI reply posted"].
 */
export type ReplyRuleSummaryInput = { rating: number; action: string };

const ACTION_TEXT: Record<string, string> = {
    approval: "wait for your approval",
    auto: "get an AI reply posted",
    template: "get your saved reply posted",
    ignore: "get no reply",
};

function ratingRange(from: number, to: number): string {
    return from === to ? `${from}★` : `${from}–${to}★`;
}

export function summarizeReplyRules(rules: ReplyRuleSummaryInput[]): string[] {
    const sorted = [...rules].sort((a, b) => a.rating - b.rating);
    const groups: Array<{ from: number; to: number; action: string }> = [];
    for (const rule of sorted) {
        const last = groups[groups.length - 1];
        if (last && last.action === rule.action && last.to === rule.rating - 1) last.to = rule.rating;
        else groups.push({ from: rule.rating, to: rule.rating, action: rule.action });
    }
    return groups.map((g) => `${ratingRange(g.from, g.to)} ${ACTION_TEXT[g.action] ?? ACTION_TEXT.approval}`);
}
