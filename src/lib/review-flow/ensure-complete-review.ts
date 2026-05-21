const SENTENCE_END = /[.!?](?:['"])?\s*$/;

/** Trailing fragment patterns from MAX_TOKENS or bad copy (e.g. "Anyone searching for a top-"). */
const INCOMPLETE_TAIL =
    /\b(for|a|an|the|to|and|or|with|at|in|on|of|top|best|great|our|your|their|this|that)\s*\-?\s*$/i;

export function isCompleteReviewText(text: string): boolean {
    const t = text.trim();
    if (t.length < 20) return false;
    if (INCOMPLETE_TAIL.test(t)) return false;
    return SENTENCE_END.test(t);
}

/**
 * Ensures AI/copied review text ends on a full sentence and mentions the business when possible.
 */
function mentionsBusiness(text: string, businessName: string): boolean {
    const lower = text.toLowerCase();
    const tokens = businessName
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2);
    return tokens.some((token) => lower.includes(token));
}

export function ensureCompleteReviewText(text: string, businessName: string): string {
    let t = text.trim().replace(/\s+/g, " ");
    if (!t) return t;

    if (!isCompleteReviewText(t)) {
        const lastEnd = Math.max(t.lastIndexOf("."), t.lastIndexOf("!"), t.lastIndexOf("?"));
        if (lastEnd >= 40) {
            t = t.slice(0, lastEnd + 1).trim();
        } else {
            t = t.replace(/[\s\-–—]+$/, "").replace(INCOMPLETE_TAIL, "").trim();
            if (!t) {
                return `Great experience at ${businessName}.`;
            }
            if (!SENTENCE_END.test(t)) {
                t = `${t}.`;
            }
        }
    }

    if (!mentionsBusiness(t, businessName)) {
        t = `${t} Highly recommend ${businessName}.`;
    }

    return t;
}
