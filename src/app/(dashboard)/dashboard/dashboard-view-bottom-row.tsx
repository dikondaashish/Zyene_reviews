import { MessageSquare } from "lucide-react";
import { NeedsAttention } from "@/components/dashboard/needs-attention";
import { DashboardAnimatedReviewCardsLazy } from "@/components/dashboard/dashboard-ssr-false-blocks";
import { mapAttentionRows } from "./helpers";
import type { DashboardViewProps } from "./types";

type Props = Pick<
    DashboardViewProps,
    | "dict"
    | "recentReviews"
    | "attentionReviews"
    | "planAllowsAiReplies"
    | "useDemoData"
>;

export function DashboardViewBottomRow({
    dict,
    recentReviews,
    attentionReviews,
    planAllowsAiReplies,
    useDemoData,
}: Props) {
    return (
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
            <div className="min-w-0 flex flex-col overflow-hidden" data-tour-target="tour-recent-reviews">
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

            <div className="min-w-0 overflow-hidden" data-tour-target="tour-needs-attention">
                <NeedsAttention
                    reviews={mapAttentionRows(
                        attentionReviews.filter(
                            (r) => (r.response_status ?? "pending") === "pending",
                        ),
                    )}
                    viewAllHref="/reviews?status=needs_response&sort=lowest"
                    planAllowsAiReplies={planAllowsAiReplies}
                    isDemo={useDemoData}
                    copy={{
                        title: dict.dashboard.needs_attention_title,
                        subtitleZero: dict.dashboard.needs_attention_subtitle_zero,
                        subtitleOne: dict.dashboard.needs_attention_subtitle_one,
                        subtitleMany: dict.dashboard.needs_attention_subtitle_many,
                        viewAll: dict.dashboard.needs_attention_view_all,
                        yourReplyLabel: dict.dashboard.needs_attention_your_reply_label,
                        sentToGoogle: dict.dashboard.needs_attention_sent_saved,
                        draftWithAi: dict.dashboard.needs_attention_draft_ai,
                        drafting: dict.dashboard.needs_attention_drafting,
                        writeYourOwn: dict.dashboard.needs_attention_write_own,
                        regenerate: dict.dashboard.needs_attention_regenerate,
                        adjustTone: dict.dashboard.needs_attention_adjust_tone,
                        toneProfessional: dict.dashboard.needs_attention_tone_professional,
                        toneFriendly: dict.dashboard.needs_attention_tone_friendly,
                        toneConcise: dict.dashboard.needs_attention_tone_concise,
                        sendReply: dict.dashboard.needs_attention_send,
                        sent: dict.dashboard.needs_attention_sent,
                        urgencyLabel: dict.dashboard.needs_attention_urgency,
                        emptyTitle: dict.dashboard.needs_attention_empty_title,
                        emptyDescription: dict.dashboard.needs_attention_empty_desc,
                        demoSendHint: dict.dashboard.needs_attention_demo_send_hint,
                    }}
                />
            </div>
        </div>
    );
}
