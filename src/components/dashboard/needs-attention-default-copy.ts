import type { NeedsAttentionCopy } from "@/components/dashboard/needs-attention-types";

export const DEFAULT_NEEDS_ATTENTION_COPY: NeedsAttentionCopy = {
    title: "Needs your attention",
    subtitleZero: "No urgent reviews right now",
    subtitleOne: "1 urgent review — we can draft a response for you",
    subtitleMany: "{count} urgent reviews — we can draft responses for you",
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
    emptyDescription: "No urgent reviews need your attention right now.",
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
