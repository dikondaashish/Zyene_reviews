import { ProStatCard } from "@/components/dashboard/pro-stat-card";
import type { DashboardViewProps } from "./types";

type Props = Pick<
    DashboardViewProps,
    | "dict"
    | "displayTotalReviews"
    | "displayAverageRating"
    | "responseRate"
    | "pendingCount"
    | "totalReviewsTrend"
    | "averageRatingTrend"
    | "responseRateLabel"
    | "isGoogleConnected"
>;

export function DashboardViewStatCards({
    dict,
    displayTotalReviews,
    displayAverageRating,
    responseRate,
    pendingCount,
    totalReviewsTrend,
    averageRatingTrend,
    responseRateLabel,
    isGoogleConnected,
}: Props) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" data-tour-target="tour-stats">
            <ProStatCard
                title={dict.dashboard.total_reviews}
                value={displayTotalReviews}
                iconName="reviews"
                description={
                    !isGoogleConnected ? dict.dashboard.connect_google : dict.dashboard.from_google
                }
                trend={totalReviewsTrend}
                trendLabel={(dict.dashboard as Record<string, string>).vs_last_year || "vs last year"}
                delay={0.1}
            />
            <ProStatCard
                title={dict.dashboard.average_rating}
                value={displayAverageRating}
                iconName="rating"
                precision={1}
                description={dict.dashboard.based_on_google}
                trend={averageRatingTrend}
                trendFormat="star_delta"
                trendLabel={
                    (dict.dashboard as Record<string, string>).vs_last_year || "vs last year"
                }
                delay={0.2}
            />
            <ProStatCard
                title={dict.dashboard.response_rate}
                value={responseRate}
                iconName="response"
                suffix="%"
                precision={1}
                description={responseRateLabel}
                delay={0.3}
            />
            <ProStatCard
                title={dict.dashboard.pending_reviews}
                value={pendingCount}
                iconName="pending"
                description={
                    pendingCount === 0
                        ? dict.dashboard.all_caught_up
                        : dict.dashboard.awaiting_response
                }
                className={pendingCount === 0 ? "border-chart-2/30 bg-chart-2/5" : ""}
                delay={0.4}
            />
        </div>
    );
}
