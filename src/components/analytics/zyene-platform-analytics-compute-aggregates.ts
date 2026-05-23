import { normalizedChannel } from "@/components/analytics/zyene-platform-analytics-channel-utils";
import { pct } from "@/components/analytics/zyene-platform-analytics-math";
import type { ReviewRequest } from "@/components/analytics/zyene-platform-analytics-types";
import {
    CheckCircle2,
    Eye,
    MousePointer2,
    Send,
    Sparkles,
    Star,
} from "lucide-react";

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
    const { allSourceRequests, totalSent, lowRatings } = base;

    const channels = ["email", "sms", "link", "both"] as const;
    const channelData = channels.map((ch) => {
        const chReqs = allSourceRequests.filter((r) => normalizedChannel(r) === ch);
        const sent =
            ch === "link"
                ? chReqs.filter((r) => r.clicked_at || r.sent_at).length
                : chReqs.filter((r) => r.sent_at).length;
        const clicked = chReqs.filter((r) => r.clicked_at).length;
        const completed = chReqs.filter((r) => r.status === "completed").length;
        return {
            channel:
                ch === "sms" ? "SMS" : ch === "email" ? "Email" : ch === "both" ? "SMS + Email" : "Link",
            sent,
            clicked,
            completed,
            clickRate: pct(clicked, sent),
            conversionRate: pct(completed, clicked),
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
    allSourceRequests.forEach((r) => {
        if (r.tags_selected) {
            r.tags_selected.forEach((tag) => {
                const clean = tag.replace(/^[^\s]+\s/, "");
                tagMap.set(clean, (tagMap.get(clean) || 0) + 1);
            });
        }
    });
    const popularTags = Array.from(tagMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);
    const maxTagCount = Math.max(...popularTags.map((t) => t.count), 1);

    const dailyMap = new Map<
        string,
        { date: string; sent: number; clicked: number; completed: number }
    >();
    allSourceRequests.forEach((r) => {
        const date = new Date(r.created_at).toISOString().split("T")[0];
        if (!dailyMap.has(date)) dailyMap.set(date, { date, sent: 0, clicked: 0, completed: 0 });
        const entry = dailyMap.get(date)!;
        if (r.sent_at) entry.sent++;
        if (r.clicked_at) entry.clicked++;
        if (r.completed_at) entry.completed++;
    });
    const dailyData = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    const lowRatingEntries = lowRatings
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

    const funnelSteps = [
        { label: "Sent", count: base.totalSent, icon: Send, color: "var(--primary)" },
        { label: "Delivered", count: base.totalDelivered, icon: CheckCircle2, color: "var(--primary)" },
        { label: "Opened", count: base.totalOpened, icon: Eye, color: "var(--primary)" },
        { label: "Link Clicked", count: base.totalClicked, icon: MousePointer2, color: "var(--primary)" },
        { label: "Completed", count: base.totalCompleted, icon: Sparkles, color: "var(--chart-5)" },
        { label: "Posted to Google", count: base.totalPostedToGoogle, icon: Star, color: "var(--chart-2)" },
    ];

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
