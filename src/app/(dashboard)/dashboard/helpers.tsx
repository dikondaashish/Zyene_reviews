import type { NeedsAttentionReview } from "@/components/dashboard/needs-attention";
import type { RawReviewRow } from "./types";

/** Compare YTD (Jan 1 → today) vs the same calendar span last year; return % change in review count and avg rating delta. */
export function computeYtdReviewTrends(
    rows: Array<{ review_date: string; rating: number }>,
    now: Date
): { totalPct: number; ratingDelta: number } {
    const startOfThisYear = new Date(now.getFullYear(), 0, 1);
    const startYtdPriorYear = new Date(now.getFullYear() - 1, 0, 1);
    const endYtdLastYear = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
    );

    const thisYtd = rows.filter((r) => {
        const d = new Date(r.review_date);
        return d >= startOfThisYear && d <= now;
    });
    const priorYtd = rows.filter((r) => {
        const d = new Date(r.review_date);
        return d >= startYtdPriorYear && d <= endYtdLastYear;
    });

    const nThis = thisYtd.length;
    const nPrior = priorYtd.length;

    let totalPct = 0;
    if (nPrior > 0) {
        totalPct = Math.round(((nThis - nPrior) / nPrior) * 100);
        totalPct = Math.max(-100, Math.min(1000, totalPct));
    } else if (nThis > 0) {
        totalPct = 100;
    }

    let ratingDelta = 0;
    if (nThis > 0 && nPrior > 0) {
        const avg = (arr: typeof thisYtd) =>
            arr.reduce((sum, r) => sum + r.rating, 0) / arr.length;
        ratingDelta = avg(thisYtd) - avg(priorYtd);
    }

    return {
        totalPct,
        ratingDelta: Math.round(ratingDelta * 100) / 100,
    };
}

function attentionReviewIsoDate(value: unknown): string {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString();
    }
    return new Date().toISOString();
}

export function mapAttentionRows(rows: RawReviewRow[]): NeedsAttentionReview[] {
    return (rows || []).map((r) => ({
        id: String(r.id),
        author: r.author_name || "Anonymous",
        avatarUrl:
            typeof r.author_avatar_url === "string" && r.author_avatar_url.trim()
                ? r.author_avatar_url.trim()
                : null,
        rating: typeof r.rating === "number" ? r.rating : Number(r.rating) || 0,
        urgency: Math.min(10, Math.max(1, Number(r.urgency_score) || 8)),
        date: attentionReviewIsoDate(r.review_date ?? r.created_at),
        text: typeof r.text === "string" ? r.text : "",
        tags: Array.isArray(r.themes) ? r.themes : [],
        platform: typeof r.platform === "string" ? r.platform : "google",
    }));
}
