/** Answer options, source-based preselection and the live guide preview for the lead wizard. */

export const LEAD_WIZARD_INDUSTRIES = [
    { id: "restaurant", label: "Restaurant or cafe", noun: "Restaurants" },
    { id: "healthcare", label: "Healthcare or dental", noun: "Clinics" },
    { id: "home_services", label: "Home services", noun: "Home service pros" },
    { id: "other", label: "Other local business", noun: "Local businesses" },
] as const;

export const LEAD_WIZARD_GOALS = [
    { id: "more_reviews", label: "Get more reviews" },
    { id: "reply_faster", label: "Reply faster" },
    { id: "protect_rating", label: "Protect my rating" },
    { id: "workflow", label: "Build one workflow" },
] as const;

export type LeadWizardIndustry = (typeof LEAD_WIZARD_INDUSTRIES)[number]["id"];
export type LeadWizardGoal = (typeof LEAD_WIZARD_GOALS)[number]["id"];
export const LEAD_WIZARD_INDUSTRY_IDS = LEAD_WIZARD_INDUSTRIES.map((i) => i.id) as [LeadWizardIndustry, ...LeadWizardIndustry[]];
export const LEAD_WIZARD_GOAL_IDS = LEAD_WIZARD_GOALS.map((g) => g.id) as [LeadWizardGoal, ...LeadWizardGoal[]];

const INDUSTRY_KEYWORDS: [LeadWizardIndustry, string[]][] = [
    ["restaurant", ["restaurant", "cafe", "coffee", "bar", "food", "hospitality"]],
    ["healthcare", ["dental", "dentist", "medical", "clinic", "health", "chiro", "doctor", "med-spa"]],
    ["home_services", ["home-services", "home_services", "plumb", "hvac", "roof", "contractor", "cleaning", "trades"]],
    ["other", ["salon", "fitness", "gym", "auto-repair", "hotel", "spa"]],
];

const GOAL_KEYWORDS: [LeadWizardGoal, string[]][] = [
    ["more_reviews", ["review-requests", "review-collection", "review-campaigns", "qr-code", "nfc", "get-more-reviews"]],
    ["reply_faster", ["ai-replies", "automatic-review-replies", "respond", "reply"]],
    ["protect_rating", ["review-monitoring", "negative", "alerts", "reputation", "protect"]],
    ["workflow", ["customer-crm", "multi-location", "workflow", "automation"]],
];

function firstMatch<T extends string>(haystacks: string[], table: [T, string[]][]): T | undefined {
    for (const text of haystacks) {
        const lower = text.toLowerCase();
        const hit = table.find(([, words]) => words.some((word) => lower.includes(word)));
        if (hit) return hit[0];
    }
    return undefined;
}

export type PreselectContext = {
    pathname: string;
    journeyPages?: string[];
    utm?: { utm_campaign?: string; utm_content?: string; utm_term?: string } | null;
};

/**
 * Preselect answers from the current page, then the pages read earlier this session (most
 * recent first), then UTM campaign words, so the guide starts personalized.
 */
export function preselectAnswers(context: PreselectContext): { industry?: LeadWizardIndustry; goal?: LeadWizardGoal } {
    const utmTexts = [context.utm?.utm_campaign, context.utm?.utm_content, context.utm?.utm_term].filter(
        (value): value is string => Boolean(value),
    );
    const pages = [context.pathname, ...[...(context.journeyPages ?? [])].reverse()];
    return {
        industry: firstMatch([...pages.filter((p) => p.startsWith("/industries/")), ...utmTexts], INDUSTRY_KEYWORDS),
        goal: firstMatch([...pages.filter((p) => p.startsWith("/features/")), ...utmTexts], GOAL_KEYWORDS),
    };
}

export type WizardCopy = { kicker: string; title: string };

/** Opening copy that matches why and where the wizard opened. */
export function openingCopy(context: { trigger: string; resumed: boolean; journeyPages: string[]; industry?: LeadWizardIndustry }): WizardCopy {
    if (context.resumed) return { kicker: "Welcome back", title: "Your playbook is one step away." };
    if (context.trigger === "exit_intent" || context.trigger === "mobile_exit") {
        return { kicker: "Before you go", title: "Take a review playbook with you." };
    }
    if (context.journeyPages.some((p) => p.startsWith("/pricing") || p.startsWith("/compare"))) {
        return { kicker: "Comparing options?", title: "See what a good review routine looks like first." };
    }
    const audience = LEAD_WIZARD_INDUSTRIES.find((i) => i.id === context.industry)?.noun;
    if (audience) return { kicker: `Free guide for ${audience.toLowerCase()}`, title: `A review playbook built for ${audience.toLowerCase()}.` };
    return { kicker: "Free guide · 2 quick questions", title: "Get a review playbook built for your business." };
}

export type GuidePreview = { title: string; audience: string; bullets: [string, string, string] };

const GOAL_COPY: Record<LeadWizardGoal, { title: string; bullets: [string, string] }> = {
    more_reviews: {
        title: "Review Growth Playbook",
        bullets: ["The two-minute ask that turns happy customers into reviews", "When to send requests by text vs. email"],
    },
    reply_faster: {
        title: "Fast Reply Playbook",
        bullets: ["Reply templates for 5-star, mixed, and 1-star reviews", "A same-day reply routine that takes ten minutes"],
    },
    protect_rating: {
        title: "Rating Protection Playbook",
        bullets: ["Catch unhappy customers before they post publicly", "How to answer a harsh review without escalating"],
    },
    workflow: {
        title: "One-Workflow Starter Kit",
        bullets: ["A weekly ask, reply, and learn loop for a small team", "Who owns what, so reviews never slip through"],
    },
};

const INDUSTRY_TIP: Record<LeadWizardIndustry, string> = {
    restaurant: "Timing tips for after the meal, not during the rush",
    healthcare: "Patient-friendly wording that stays privacy-safe",
    home_services: "Asking right after the job, while the van is still outside",
    other: "Examples from salons, gyms, shops, and studios",
};

export function guidePreview(industry?: LeadWizardIndustry, goal?: LeadWizardGoal): GuidePreview {
    const audience = LEAD_WIZARD_INDUSTRIES.find((i) => i.id === industry)?.noun ?? "Local businesses";
    if (!goal) {
        return {
            title: "The Local Reputation Guide",
            audience,
            bullets: [
                "Simple ways to collect more honest reviews",
                "Reply templates that sound like you",
                industry ? INDUSTRY_TIP[industry] : "A weekly routine any team can keep",
            ],
        };
    }
    const copy = GOAL_COPY[goal];
    return { title: copy.title, audience, bullets: [copy.bullets[0], copy.bullets[1], industry ? INDUSTRY_TIP[industry] : "A weekly routine any team can keep"] };
}

/** The most relevant next step after the download. */
export function nextStepFor(goal?: LeadWizardGoal): { label: string; href: string; kind: "trial" | "demo" } {
    if (goal === "protect_rating" || goal === "workflow") return { label: "Book a 15-minute demo", href: "/demo", kind: "demo" };
    return { label: "Start your free trial", href: "/signup", kind: "trial" };
}
