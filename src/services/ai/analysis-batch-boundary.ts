export type BatchReview = { id: string; business_id: string | null };

export function assertSingleBusinessBatch(reviewIds: string[], reviews: BatchReview[]) {
    if (reviews.length !== reviewIds.length || new Set(reviewIds).size !== reviewIds.length) {
        throw new Error("Analysis batch contains unavailable or duplicate reviews");
    }
    const businessId = reviews[0]?.business_id;
    if (!businessId || reviews.some((review) => review.business_id !== businessId) ||
        reviews.some((review) => !reviewIds.includes(review.id))) {
        throw new Error("Analysis batch must contain reviews from one business");
    }
    return { businessId, allowedIds: new Set(reviewIds) };
}

export function isAllowedAnalysisResult(reviewId: string | undefined, allowedIds: Set<string>): reviewId is string {
    return Boolean(reviewId && allowedIds.has(reviewId));
}
