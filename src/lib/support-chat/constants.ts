/** Shared by the marketing chat widget and its API routes. */

export const SUPPORT_AGENT_NAME = "Charlie";
export const SUPPORT_AGENT_AVATAR = "/brand/mascot/zyene-mascot-master-v1.png";

export const SUPPORT_CHAT_GREETING = [
    `Hi, I'm ${SUPPORT_AGENT_NAME}, an AI agent that can answer your questions about Zyene Reviews. You can also ask for a human.`,
    "How can I help?",
] as const;

export const SUPPORT_CHAT_TEASER = "Hi there, have a question? Text us here.";

export const SUPPORT_CHAT_STARTERS = [
    "How much does it cost?",
    "How do I get more Google reviews?",
    "Can AI reply to my reviews?",
    "Is there a free trial?",
] as const;

/** After this many answered questions the visitor is asked for contact details. */
export const LEAD_GATE_AFTER_QUESTIONS = 4;

export const MAX_USER_MESSAGE_CHARS = 600;
export const MAX_ASSISTANT_MESSAGE_CHARS = 2_000;
/** Only the most recent turns go to the model; older context adds cost, not accuracy. */
export const MAX_HISTORY_MESSAGES = 12;

export const BUSINESS_TYPES = [
    "Restaurant or cafe",
    "Salon, spa or beauty",
    "Medical or dental",
    "Home services",
    "Automotive",
    "Retail store",
    "Fitness or wellness",
    "Hotel or hospitality",
    "Professional services",
    "Marketing agency",
    "Other",
] as const;

export type SupportChatRole = "user" | "assistant";

export type SupportChatIntent = "answer" | "handoff" | "off_topic";

export interface SupportChatMessage {
    id: string;
    role: SupportChatRole;
    content: string;
}
