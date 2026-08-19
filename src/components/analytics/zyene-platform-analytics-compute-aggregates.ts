import { normalizedChannel } from "@/components/analytics/zyene-platform-analytics-channel-utils";
import type { ReviewRequest } from "@/components/analytics/zyene-platform-analytics-types";
import {
  calculateRequestMetrics,
  isClickedRequest,
  isCompletedRequest,
  isOutboundRequest,
  isSentRequest,
} from "@/lib/metrics/business-metrics";
import { buildZyenePlatformFunnelSteps } from "@/components/analytics/zyene-platform-funnel-steps";

type BaseStats = {
  allSourceRequests: ReviewRequest[];
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalCompleted: number;
  totalPostedToGoogle: number;
  lowRatings: ReviewRequest[];
};

export function computeZyenePlatformAnalyticsAggregates(base: BaseStats) {
  const { allSourceRequests, lowRatings } = base;

  const channels = ["email", "sms", "link", "both"] as const;
  const channelData = channels.map((ch) => {
    const chReqs = allSourceRequests.filter((r) => normalizedChannel(r) === ch);
    const metrics = calculateRequestMetrics(chReqs);
    const sent = metrics.totalSent;
    const clicked = metrics.clicked;
    const completed = metrics.completed;
    return {
      channel:
        ch === "sms"
          ? "SMS"
          : ch === "email"
            ? "Email"
            : ch === "both"
              ? "SMS + Email"
              : "Link",
      sent,
      clicked,
      completed,
      clickRate: Math.round(metrics.clickRate),
      conversionRate: Math.round(metrics.conversionRate),
    };
  });

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star: `${star}★`,
    value: star,
    count: allSourceRequests.filter((r) => r.rating_given === star).length,
  }));
  const maxRatingCount = Math.max(...ratingDist.map((d) => d.count), 1);
  const ratingColors: Record<number, string> = {
    5: "var(--chart-2)",
    4: "var(--chart-3)",
    3: "var(--chart-5)",
    2: "var(--primary)",
    1: "var(--destructive)",
  };

  const tagMap = new Map<string, number>();
  const dailyMap = new Map<
    string,
    { date: string; sent: number; clicked: number; completed: number }
  >();
  for (const r of allSourceRequests) {
    if (!isOutboundRequest(r)) continue;
    if (r.tags_selected) {
      for (const tag of r.tags_selected) {
        const clean = tag.replace(/^[^\s]+\s/, "");
        tagMap.set(clean, (tagMap.get(clean) || 0) + 1);
      }
    }
    const date = new Date(r.created_at).toISOString().split("T")[0];
    if (!dailyMap.has(date))
      dailyMap.set(date, { date, sent: 0, clicked: 0, completed: 0 });
    const entry = dailyMap.get(date)!;
    if (isSentRequest(r)) entry.sent++;
    if (isClickedRequest(r)) entry.clicked++;
    if (isCompletedRequest(r)) entry.completed++;
  }
  const popularTags = Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
  const maxTagCount = Math.max(...popularTags.map((t) => t.count), 1);

  const dailyData = Array.from(dailyMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  const lowRatingEntries = lowRatings
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 10);

  const funnelSteps = buildZyenePlatformFunnelSteps(base);

  return {
    channelData,
    ratingDist,
    maxRatingCount,
    ratingColors,
    popularTags,
    maxTagCount,
    dailyData,
    lowRatingEntries,
    funnelSteps,
  };
}
