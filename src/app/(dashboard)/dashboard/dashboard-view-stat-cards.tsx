import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
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
    | "newReviews30d"
    | "requestsThisMonth"
    | "maxRequestsPerMonth"
    | "isPaidPlan"
>;

const fmt = (n: number) => n.toLocaleString("en-US");
const tone = (n: number) => (n > 0 ? "text-success" : n < 0 ? "text-destructive" : "text-muted-foreground");

function Metric({ label, value, children }: { label: string; value: ReactNode; children: ReactNode }) {
    return (
        <div className="min-w-0 bg-card px-5 py-4 sm:px-6">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
            <div className="mt-1 text-xs leading-5">{children}</div>
        </div>
    );
}

/** One calm summary instead of eight tiles. The numbers share one definition with the waiting card. */
export function DashboardViewStatCards(props: Props) {
    const { dict, displayTotalReviews: total, displayAverageRating: rating, pendingCount, newReviews30d } = props;
    const d = dict.dashboard;
    const ratingDelta = Math.round(props.averageRatingTrend * 10) / 10;
    const reviewsPct = Math.round(props.totalReviewsTrend);
    const usageShare = props.maxRequestsPerMonth > 0 ? props.requestsThisMonth / props.maxRequestsPerMonth : 0;

    return (
        <section aria-labelledby="reputation-title" data-tour-target="tour-stats" className="overflow-hidden rounded-xl border bg-card">
            <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
                <div className="min-w-0">
                    <h2 id="reputation-title" className="ui-section-title">{d.reputation_title}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">{d.reputation_subtitle}</p>
                </div>
                <Link href="/analytics" className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline">
                    {d.see_full_analytics}<ArrowRight className="size-3.5" aria-hidden />
                </Link>
            </header>
            <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
                <Metric
                    label={d.average_rating}
                    value={
                        <span className="flex items-center gap-2">
                            {total > 0 ? rating.toFixed(1) : "-"}
                            <span className="flex" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
                                {Array.from({ length: 5 }, (_, i) => (
                                    <Star key={i} className={cn("size-4", i < Math.round(rating) ? "text-warning" : "text-muted-foreground/25")} aria-hidden />
                                ))}
                            </span>
                        </span>
                    }
                >
                    <span className={tone(ratingDelta)}>
                        {ratingDelta === 0
                            ? d.rating_trend_flat
                            : d.rating_trend.replace("{delta}", `${ratingDelta > 0 ? "+" : ""}${ratingDelta.toFixed(1)}`)}
                    </span>
                </Metric>
                <Metric label={d.total_reviews} value={fmt(total)}>
                    <span className={tone(reviewsPct)}>
                        {reviewsPct === 0
                            ? d.reviews_trend_flat
                            : (reviewsPct > 0 ? d.reviews_trend_up : d.reviews_trend_down).replace("{pct}", String(Math.abs(reviewsPct)))}
                    </span>
                </Metric>
                <Metric label={d.replied_title} value={`${Math.round(props.responseRate)}%`}>
                    {pendingCount > 0 ? (
                        <Link href="/reviews?status=needs_response" className="font-medium text-foreground underline underline-offset-2">
                            {pendingCount === 1 ? d.still_need_reply_one : d.still_need_reply_many.replace("{count}", fmt(pendingCount))}
                        </Link>
                    ) : (
                        <span className="text-success">{d.all_replied}</span>
                    )}
                </Metric>
                <Metric label={d.new_this_month_title} value={fmt(newReviews30d)}>
                    <span className="text-muted-foreground">{d.new_reviews_30d_desc}</span>
                </Metric>
            </div>
            {usageShare >= 0.8 && (
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border px-5 py-3 text-xs text-foreground sm:px-6">
                    {d.usage_warning.replace("{used}", fmt(props.requestsThisMonth)).replace("{max}", fmt(props.maxRequestsPerMonth))}
                    {!props.isPaidPlan && (
                        <Link href="/settings/billing" className="font-medium text-primary hover:underline">{d.upgrade_prompt || "Upgrade"}</Link>
                    )}
                </p>
            )}
        </section>
    );
}
