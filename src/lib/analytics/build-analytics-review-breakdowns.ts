import { effectiveReviewAt } from "@/lib/analytics/review-timeline";
import {
  calculateReviewMetrics,
  type ReviewMetrics,
} from "@/lib/metrics/business-metrics";

export type AnalyticsReviewRow = {
  review_date?: string;
  created_at?: string;
  platform?: unknown;
  rating?: number;
  response_status?: string;
  responded_at?: string | null;
  themes?: string[];
  [key: string]: unknown;
};

function buildTrendData(reviews: AnalyticsReviewRow[]) {
  const dateMap = new Map<string, AnalyticsReviewRow[]>();
  for (const review of reviews) {
    const date = effectiveReviewAt(review).toISOString().split("T")[0];
    const rows = dateMap.get(date) ?? [];
    rows.push(review);
    dateMap.set(date, rows);
  }
  return Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, rows]) => {
      const metrics = calculateReviewMetrics(rows);
      return {
        date,
        rating: metrics.averageRating,
        count: metrics.totalReviews,
        positive: metrics.positiveReviews,
        neutral: metrics.neutralReviews,
        negative: metrics.negativeReviews,
      };
    });
}

function buildSentimentData(metrics: ReviewMetrics) {
  return [
    {
      name: "Positive (4–5★)",
      value: metrics.positiveReviews,
      color: "var(--chart-2)",
    },
    {
      name: "Neutral (3★)",
      value: metrics.neutralReviews,
      color: "var(--chart-3)",
    },
    {
      name: "Negative (1–2★)",
      value: metrics.negativeReviews,
      color: "var(--destructive)",
    },
  ].filter((item) => item.value > 0);
}

function buildThemeData(reviews: AnalyticsReviewRow[]) {
  const themes = new Map<string, { count: number; sentimentScore: number }>();
  for (const review of reviews) {
    if (!Array.isArray(review.themes)) continue;
    for (const rawTheme of review.themes) {
      const theme = rawTheme.toLowerCase();
      const entry = themes.get(theme) ?? { count: 0, sentimentScore: 0 };
      entry.count += 1;
      if (review.rating && review.rating >= 4) entry.sentimentScore += 1;
      if (review.rating && review.rating <= 2) entry.sentimentScore -= 1;
      themes.set(theme, entry);
    }
  }
  const result: Array<{
    theme: string;
    count: number;
    sentimentScore: number;
  }> = [];
  for (const [theme, data] of themes) {
    if (data.count >= 2) result.push({ theme, ...data });
  }
  result.sort((a, b) => b.count - a.count);
  return result.slice(0, 10);
}

function platformName(platform: unknown): string {
  const raw = typeof platform === "string" ? platform.trim().toLowerCase() : "";
  if (!raw || raw === "zyene") return "Own Platform";
  if (raw === "google") return "Google";
  if (raw === "facebook") return "Facebook";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function buildPlatformData(
  reviews: AnalyticsReviewRow[],
  performance: Record<string, unknown> | null,
) {
  const groups = new Map<string, AnalyticsReviewRow[]>();
  for (const review of reviews) {
    const name = platformName(review.platform);
    groups.set(name, [...(groups.get(name) ?? []), review]);
  }
  const googlePerformance = performance as {
    profileViews?: number;
    callClicks?: number;
    directionRequests?: number;
    websiteClicks?: number;
  } | null;
  const order = ["Google", "Own Platform", "Facebook"];
  return Array.from(groups.entries())
    .map(([name, rows]) => {
      const metrics = calculateReviewMetrics(rows);
      return {
        platform: name,
        reviews: metrics.totalReviews,
        avgRating: metrics.averageRating,
        responseRate: metrics.responseRate,
        profileViews:
          name === "Google" ? googlePerformance?.profileViews : undefined,
        callClicks:
          name === "Google" ? googlePerformance?.callClicks : undefined,
        directionRequests:
          name === "Google" ? googlePerformance?.directionRequests : undefined,
        websiteClicks:
          name === "Google" ? googlePerformance?.websiteClicks : undefined,
      };
    })
    .sort((a, b) => {
      const ai = order.indexOf(a.platform);
      const bi = order.indexOf(b.platform);
      if (ai === -1 && bi === -1) return b.reviews - a.reviews;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
}

export function buildAnalyticsReviewBreakdowns(
  reviews: AnalyticsReviewRow[],
  metrics: ReviewMetrics,
  performance: Record<string, unknown> | null,
) {
  return {
    trendData: buildTrendData(reviews),
    sentimentData: buildSentimentData(metrics),
    themeData: buildThemeData(reviews),
    platformData: buildPlatformData(reviews, performance),
  };
}
