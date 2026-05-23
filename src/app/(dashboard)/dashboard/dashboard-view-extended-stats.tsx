import Link from "next/link";
import { ArrowRight, ThumbsUp, Target, Send, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DashboardViewProps } from "./types";

type Props = Pick<
    DashboardViewProps,
    | "dict"
    | "positivePercent"
    | "negativePercent"
    | "hasSentimentData"
    | "engagementRate"
    | "hasEngagementData"
    | "requestsThisMonth"
    | "maxRequestsPerMonth"
    | "isPaidPlan"
    | "newReviews30d"
>;

export function DashboardViewExtendedStats({
    dict,
    positivePercent,
    negativePercent,
    hasSentimentData,
    engagementRate,
    hasEngagementData,
    requestsThisMonth,
    maxRequestsPerMonth,
    isPaidPlan,
    newReviews30d,
}: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {dict.dashboard.positive_experience}
                    </CardTitle>
                    <ThumbsUp className="text-muted-foreground size-4" />
                </CardHeader>
                <CardContent>
                    <div
                        className={`text-2xl font-bold ${
                            !hasSentimentData
                                ? "text-muted-foreground"
                                : positivePercent > 60
                                  ? "text-chart-2"
                                  : positivePercent >= 40
                                    ? "text-chart-4"
                                    : "text-destructive"
                        }`}
                    >
                        {hasSentimentData ? `${positivePercent.toFixed(0)}%` : "-"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {hasSentimentData
                            ? `${negativePercent.toFixed(0)}% ${dict.dashboard.negative_mixed}`
                            : dict.dashboard.no_sentiment_data}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {dict.dashboard.engagement_rate}
                    </CardTitle>
                    <Target className="text-muted-foreground size-4" />
                </CardHeader>
                <CardContent>
                    <div
                        className={`text-2xl font-bold ${
                            !hasEngagementData ? "text-muted-foreground" : ""
                        }`}
                    >
                        {hasEngagementData ? `${engagementRate.toFixed(1)}%` : "-"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {hasEngagementData
                            ? dict.dashboard.engagement_desc
                            : dict.dashboard.no_engagement_data}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{dict.dashboard.usage_title}</CardTitle>
                    <Send className="text-muted-foreground size-4" />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div
                            className={`text-2xl font-bold ${
                                maxRequestsPerMonth > 0 &&
                                requestsThisMonth / maxRequestsPerMonth > 0.95
                                    ? "text-destructive"
                                    : maxRequestsPerMonth > 0 &&
                                        requestsThisMonth / maxRequestsPerMonth > 0.8
                                      ? "text-chart-4"
                                      : ""
                            }`}
                        >
                            {requestsThisMonth} / {maxRequestsPerMonth}
                        </div>
                        {!isPaidPlan && (
                            <Link href="/settings/billing" className="w-full shrink-0 lg:w-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-full text-xs border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 lg:w-auto"
                                >
                                    <ArrowRight className="mr-1 size-3" />
                                    {dict.dashboard.upgrade_prompt || "Upgrade"}
                                </Button>
                            </Link>
                        )}
                    </div>
                    <Progress
                        value={
                            maxRequestsPerMonth > 0
                                ? Math.min((requestsThisMonth / maxRequestsPerMonth) * 100, 100)
                                : 0
                        }
                        className="mt-2 h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{dict.dashboard.usage_desc}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {dict.dashboard.new_reviews_30d}
                    </CardTitle>
                    <Calendar className="text-muted-foreground size-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{newReviews30d}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {dict.dashboard.new_reviews_30d_desc}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
