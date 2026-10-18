/**
 * Buttons Natalie may attach to a reply. The model only picks keys from this fixed
 * catalog, so it can never invent a destination or label.
 */
export const SUPPORT_CHAT_ACTIONS = {
    start_trial: { label: "Start free trial", kind: "link", href: "/signup" },
    see_pricing: { label: "See pricing", kind: "link", href: "/pricing" },
    book_demo: { label: "Book a demo", kind: "tool" },
    check_reputation: { label: "Check my rating", kind: "tool" },
    talk_to_human: { label: "Talk to a person", kind: "tool" },
    see_features: { label: "Explore features", kind: "link", href: "/features" },
    see_integrations: { label: "See integrations", kind: "link", href: "/integrations" },
} as const;

export type SupportChatActionKey = keyof typeof SUPPORT_CHAT_ACTIONS;

export const SUPPORT_CHAT_ACTION_KEYS = Object.keys(SUPPORT_CHAT_ACTIONS) as SupportChatActionKey[];

export function isSupportChatActionKey(value: unknown): value is SupportChatActionKey {
    return typeof value === "string" && value in SUPPORT_CHAT_ACTIONS;
}

/** Interactive cards Natalie can open inside the thread. */
export type SupportChatWidget = "reputation" | "demo";
