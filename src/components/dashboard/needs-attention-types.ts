export type NeedsAttentionReview = {
    id: string;
    author: string;
    /** Google/Yelp reviewer photo when synced (`reviews.author_avatar_url`). */
    avatarUrl?: string | null;
    rating: number;
    urgency: number;
    /** ISO string — must be JSON-serializable when passed from a Server Component. */
    date: string;
    text: string;
    tags: string[];
    /** `google` (default) or `yelp` — only Google supports in-app reply posting. */
    platform?: string;
};

/** Plain strings only (no functions) so `copy` can cross the RSC → client boundary. */
export type NeedsAttentionCopy = {
    title: string;
    subtitleZero: string;
    subtitleOne: string;
    /** Use `{count}` placeholder for counts greater than 1. */
    subtitleMany: string;
    viewAll: string;
    yourReplyLabel: string;
    sentToGoogle: string;
    draftWithAi: string;
    drafting: string;
    writeYourOwn: string;
    regenerate: string;
    adjustTone: string;
    toneProfessional: string;
    toneFriendly: string;
    toneConcise: string;
    sendReply: string;
    sent: string;
    /** Use `{score}` placeholder. */
    urgencyLabel: string;
    emptyTitle: string;
    emptyDescription: string;
    /** Shown under Send when demo data is active (cannot post to Google). */
    demoSendHint: string;
};
