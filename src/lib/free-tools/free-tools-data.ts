// ─────────────────────────────────────────────────────────────────────────────
// Free lead-gen tools — Phase 7.3
// ─────────────────────────────────────────────────────────────────────────────

export interface FreeToolDefinition {
    slug: string;
    title: string;
    description: string;
    icon: "link" | "chart" | "message";
    leadSource: string;
}

export const FREE_TOOLS: FreeToolDefinition[] = [
    {
        slug: "review-link-generator",
        title: "Google Review Link Generator",
        description:
            "Find your business on Google Maps and get a direct “Write a review” link you can text, email, or print on receipts.",
        icon: "link",
        leadSource: "tool_review_link",
    },
    {
        slug: "reputation-score-checker",
        title: "Reputation Score Checker",
        description:
            "See your public Google rating, review count, and a quick response-rate estimate — then get the full report by email.",
        icon: "chart",
        leadSource: "tool_reputation_score",
    },
    {
        slug: "review-response-generator",
        title: "Review Response Generator",
        description:
            "Paste any review and get a professional AI draft reply. Enter your email to unlock 5 more templates.",
        icon: "message",
        leadSource: "tool_review_response",
    },
];

export function getFreeToolBySlug(slug: string): FreeToolDefinition | undefined {
    return FREE_TOOLS.find((t) => t.slug === slug);
}
