export type ReviewText = { id: string; text: string };
export type ReviewCitationMatch = {
    reviewId: string;
    answerExcerpt: string;
    reviewExcerpt: string;
    matchKind: "quote" | "paraphrase";
    confidence: number;
};

const STOP_WORDS = new Set(["the", "a", "an", "and", "or", "but", "to", "of", "in", "on", "for", "is", "are", "was", "were", "they", "this", "that", "very"]);

function normalized(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function terms(value: string): Set<string> {
    return new Set(normalized(value).split(" ").filter((word) => word.length > 2 && !STOP_WORDS.has(word)));
}

function overlap(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 || b.size === 0) return 0;
    let shared = 0;
    for (const word of a) if (b.has(word)) shared += 1;
    return shared / Math.min(a.size, b.size);
}

/** Conservative lexical evidence pass; model-assisted paraphrases are stored only after this candidate gate. */
export function matchReviewCorpus(answer: string, reviews: readonly ReviewText[]): ReviewCitationMatch[] {
    const answerNormalized = normalized(answer);
    const answerTerms = terms(answer);
    const matches: ReviewCitationMatch[] = [];
    for (const review of reviews) {
        const reviewNormalized = normalized(review.text);
        if (reviewNormalized.length < 20) continue;
        if (answerNormalized.includes(reviewNormalized)) {
            matches.push({ reviewId: review.id, answerExcerpt: review.text, reviewExcerpt: review.text, matchKind: "quote", confidence: 1 });
            continue;
        }
        const score = overlap(answerTerms, terms(review.text));
        if (score >= 0.72) matches.push({ reviewId: review.id, answerExcerpt: answer.slice(0, 500), reviewExcerpt: review.text.slice(0, 500), matchKind: "paraphrase", confidence: Number(score.toFixed(3)) });
    }
    return matches.sort((a, b) => b.confidence - a.confidence);
}
