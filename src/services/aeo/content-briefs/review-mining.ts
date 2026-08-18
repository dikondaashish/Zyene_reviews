const STOP = new Set(["this", "that", "with", "have", "they", "were", "from", "very", "just", "would", "there", "their", "about", "when", "what", "your", "great", "good"]);

export function mineReviewThemes(reviews: readonly string[], limit = 8): { theme: string; mentions: number; examples: string[] }[] {
    const byTerm = new Map<string, { mentions: number; examples: string[] }>();
    for (const review of reviews) {
        const seen = new Set(review.toLowerCase().match(/[a-z]{4,}/g)?.filter((word) => !STOP.has(word)) ?? []);
        for (const word of seen) {
            const row = byTerm.get(word) ?? { mentions: 0, examples: [] };
            row.mentions += 1;
            if (row.examples.length < 2) row.examples.push(review.slice(0, 220));
            byTerm.set(word, row);
        }
    }
    return [...byTerm].map(([theme, row]) => ({ theme, ...row }))
        .filter((row) => row.mentions >= 2).sort((a, b) => b.mentions - a.mentions || a.theme.localeCompare(b.theme)).slice(0, limit);
}
