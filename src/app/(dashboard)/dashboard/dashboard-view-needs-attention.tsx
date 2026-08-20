import { NeedsAttention } from "@/components/dashboard/needs-attention";
import { mapAttentionRows } from "./helpers";
import type { DashboardViewProps } from "./types";

type Props = Pick<
    DashboardViewProps,
    "dict" | "attentionReviews" | "planAllowsAiReplies" | "useDemoData"
>;

export function DashboardViewNeedsAttention({
    dict,
    attentionReviews,
    planAllowsAiReplies,
    useDemoData,
}: Props) {
    const pendingReviews = attentionReviews.filter(
        (review) => (review.response_status ?? "pending") === "pending",
    );

    return (
        <div className="min-w-0" data-tour-target="tour-needs-attention">
            <NeedsAttention
                reviews={mapAttentionRows(pendingReviews)}
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
    );
}
