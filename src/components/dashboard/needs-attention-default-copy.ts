import type { NeedsAttentionCopy } from "@/components/dashboard/needs-attention-types";

export const DEFAULT_NEEDS_ATTENTION_COPY: NeedsAttentionCopy = {
    title: "Needs your attention",
    subtitleZero: "No unhappy reviews are waiting for a reply",
    subtitleOne: "1 unhappy review has no reply. We can draft one for you.",
    subtitleMany: "{count} unhappy reviews have no reply. Most urgent first.",
    viewAll: "View all",
    yourReplyLabel: "Your reply as owner",
    sentToGoogle: "Posted to Google",
    draftWithAi: "Draft response with AI",
    drafting: "Drafting…",
    writeYourOwn: "Or write your own",
    regenerate: "Regenerate",
    adjustTone: "Adjust tone",
    toneProfessional: "Professional",
    toneFriendly: "Friendly",
    toneConcise: "Concise",
    sendReply: "Send reply",
    sent: "Sent",
    urgencyLabel: "Urgency {score}",
    emptyTitle: "All clear!",
    emptyDescription: "Every 1 and 2-star review has a reply.",
    demoSendHint: "Connect Google Business Profile to post replies from here.",
};

export function subtitleFor(copy: NeedsAttentionCopy, urgentCount: number): string {
    if (urgentCount <= 0) return copy.subtitleZero;
    if (urgentCount === 1) return copy.subtitleOne;
    return copy.subtitleMany.replace("{count}", String(urgentCount));
}

export function urgencyText(copy: NeedsAttentionCopy, score: number): string {
    return copy.urgencyLabel.replace("{score}", String(score));
}
