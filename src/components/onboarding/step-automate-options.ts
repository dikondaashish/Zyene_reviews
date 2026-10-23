/** The three reply set-ups offered during onboarding, written as reply rules per star rating. */
export type AutomateChoice = "recommended" | "approve_all" | "manual";

type RuleAction = "approval" | "auto" | "ignore";

export type AutomateOption = {
    id: AutomateChoice;
    title: string;
    description: string;
    /** What Zyene will do, in the owner's words, for the "Zyene will now" summary. */
    willNow: string[];
    /** Rules for 5, 4, 3, 2 and 1 stars, or null to leave reply rules off. */
    actions: [RuleAction, RuleAction, RuleAction, RuleAction, RuleAction] | null;
    needsAutoPlan: boolean;
};

export const AUTOMATE_OPTIONS: AutomateOption[] = [
    {
        id: "recommended",
        title: "Reply to happy customers for me",
        description: "Zyene posts replies to 4 and 5-star reviews. You approve replies to 1 to 3-star reviews.",
        willNow: [
            "Reply to new 4 and 5-star Google reviews for you",
            "Draft replies to 1 to 3-star reviews and ask you to approve them",
        ],
        actions: ["auto", "auto", "approval", "approval", "approval"],
        needsAutoPlan: true,
    },
    {
        id: "approve_all",
        title: "Let me check every reply",
        description: "Zyene drafts a reply to every new review. Nothing is posted until you approve it.",
        willNow: ["Draft a reply to every new Google review and ask you to approve it"],
        actions: ["approval", "approval", "approval", "approval", "approval"],
        needsAutoPlan: false,
    },
    {
        id: "manual",
        title: "I'll reply myself",
        description: "No drafts. You can turn this on later in Settings, Reply rules.",
        willNow: ["Leave replying to you. Turn on drafts any time in Settings, Reply rules"],
        actions: null,
        needsAutoPlan: false,
    },
];

/** Body for PUT /api/settings/reply-rules. Approvers stay empty: owners, admins and managers approve. */
export function replyRulesPayload(businessId: string, option: AutomateOption) {
    const actions = option.actions ?? ["approval", "approval", "approval", "approval", "approval"];
    return {
        businessId,
        enabled: option.actions !== null,
        rules: [5, 4, 3, 2, 1].map((rating, i) => ({ rating, action: actions[i], templateId: null })),
        approverUserIds: [] as string[],
    };
}

export function availableOptions(autoAllowed: boolean): AutomateOption[] {
    return AUTOMATE_OPTIONS.filter((option) => autoAllowed || !option.needsAutoPlan);
}
