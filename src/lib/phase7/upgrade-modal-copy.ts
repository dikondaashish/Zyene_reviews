// ─────────────────────────────────────────────────────────────────────────────
// In-product upgrade modal copy — Phase 7.4
// ─────────────────────────────────────────────────────────────────────────────

export type UpgradeModalContext =
    | "ai_reply_limit"
    | "ai_reply_plan"
    | "ai_analysis"
    | "auto_commenter"
    | "review_request_limit"
    | "business_location"
    | "widget"
    | "generic_limit"
    | "generic_plan";

export function getUpgradeModalCopy(context: UpgradeModalContext): { title: string; description: string } {
    switch (context) {
        case "ai_reply_limit":
            return {
                title: "Upgrade for more AI replies",
                description:
                    "Upgrade to Starter for 1,500 AI replies/month — save 5+ hours/week responding to reviews. Professional adds 3,000/month across up to 3 locations.",
            };
        case "ai_reply_plan":
            return {
                title: "Upgrade for AI reply suggestions",
                description:
                    "AI-assisted replies are on Starter ($29.99/mo) and above — 1,500 smart replies/month so you never leave a review unanswered.",
            };
        case "ai_analysis":
            return {
                title: "Upgrade for AI review analysis",
                description:
                    "Unlock AI sentiment and theme analysis on Starter — spot trends in 1- and 2-star reviews before they hurt your rating.",
            };
        case "auto_commenter":
            return {
                title: "Upgrade to use Auto commenter",
                description:
                    "Auto commenter posts AI replies to eligible Google reviews on Starter and above — 1,500 AI replies/month, no manual copy-paste.",
            };
        case "review_request_limit":
            return {
                title: "Upgrade for more review requests",
                description:
                    "You've hit your monthly SMS review request limit. Starter includes 500 SMS + 500 email requests/month; Professional scales to 1,500 SMS per location.",
            };
        case "business_location":
            return {
                title: "Add more business locations",
                description:
                    "Add 2 more locations with Professional — $59.99/mo for up to 3 locations, each with its own review inbox and request limits.",
            };
        case "widget":
            return {
                title: "Upgrade for website widgets",
                description:
                    "Embeddable review carousels and rating badges are on paid plans. Starter from $29.99/mo — showcase 5-star reviews on your site automatically.",
            };
        case "generic_plan":
            return {
                title: "Upgrade your plan",
                description:
                    "This feature is included on Starter ($29.99/mo) and Professional ($59.99/mo). Choose a plan to unlock review automation, AI replies, and competitor tracking.",
            };
        case "generic_limit":
        default:
            return {
                title: "Upgrade your plan",
                description:
                    "You've reached a limit on your current plan. Upgrade to Starter for 1,500 AI replies/month and automated review requests — or Professional for 3 locations.",
            };
    }
}
