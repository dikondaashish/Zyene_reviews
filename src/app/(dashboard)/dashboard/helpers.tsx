import { Star } from "lucide-react";
import type { NeedsAttentionReview } from "@/components/dashboard/needs-attention";
import type { RawReviewRow } from "./types";

export function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i <= rating
                        ? "fill-chart-4 text-chart-4"
                        : "fill-muted text-muted"
                        }`}
                />
            ))}
        </div>
    );
}

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

export function SentimentBadge({ sentiment }: { sentiment: string | null }) {
    if (!sentiment) return null;
    const colors: Record<string, string> = {
        positive: "bg-chart-2/15 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2",
        negative: "bg-destructive/15 text-destructive dark:bg-destructive/20 dark:text-destructive",
        neutral: "bg-muted text-muted-foreground",
        mixed: "bg-chart-4/15 text-chart-4 dark:bg-chart-4/20 dark:text-chart-4",
    };
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[sentiment] || colors.neutral
                }`}
        >
            {sentiment}
        </span>
    );
}

export function attentionReviewIsoDate(value: unknown): string {
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
