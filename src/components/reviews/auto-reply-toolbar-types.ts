export type AutoReplyTone = "professional" | "friendly" | "concise";

export interface AutoReplySettingsState {
    auto_reply_enabled: boolean;
    auto_reply_min_rating: 3 | 4 | 5;
    auto_reply_tone: AutoReplyTone;
}

export const AUTO_REPLY_TONES: { id: AutoReplyTone; label: string }[] = [
    { id: "professional", label: "Professional" },
    { id: "friendly", label: "Friendly" },
    { id: "concise", label: "Concise" },
];

export const AUTO_COMMENTER_HELP =
    "Only reviews that show up after you turn this on: if there is no reply yet and the stars meet your minimum, we draft a reply in your tone and post it on Google. Plan limits still apply.";
