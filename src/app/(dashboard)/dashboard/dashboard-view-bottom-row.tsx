import { MessageSquare } from "lucide-react";
import { DashboardAnimatedReviewCardsLazy } from "@/components/dashboard/dashboard-ssr-false-blocks";
import type { DashboardViewProps } from "./types";

type Props = Pick<DashboardViewProps, "dict" | "recentReviews">;

export function DashboardViewBottomRow({ dict, recentReviews }: Props) {
    return (
        <div className="min-w-0" data-tour-target="tour-recent-reviews">
            <div className="flex min-w-0 flex-col overflow-hidden">
                {recentReviews.length > 0 ? (
                    <div className="flex-1 flex flex-col">
                        <DashboardAnimatedReviewCardsLazy
                            reviews={recentReviews.slice(0, 15).map((r) => ({
                                id: String(r.id),
                                name: r.author_name || "Anonymous",
                                avatar: r.author_avatar_url || "",
                                text: r.text || "No review content provided.",
                                rating:
                                    typeof r.rating === "number"
                                        ? r.rating
                                        : Number(r.rating) || 0,
                                reviewedAt: r.review_date ?? new Date().toISOString(),
                                platform: r.platform ?? "google",
                                sentiment: r.sentiment ?? null,
                            }))}
                            labels={{
                                hint: dict.dashboard.review_spotlight_hint,
                                prev: dict.dashboard.review_spotlight_prev,
                                next: dict.dashboard.review_spotlight_next,
                                viewInReviews: dict.dashboard.review_spotlight_view_inbox,
                            }}
                            shellTitle={dict.dashboard.review_spotlight_title}
                            shellSubtitle={dict.dashboard.review_spotlight_desc}
                            manageAllHref="/reviews"
                            manageAllLabel={dict.dashboard.review_spotlight_manage_all}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 py-20">
                        <MessageSquare className="mb-4 text-muted-foreground/30 size-10" />
                        <p className="text-sm text-muted-foreground">
                            {dict.dashboard.review_spotlight_empty}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
