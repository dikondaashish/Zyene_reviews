// ─────────────────────────────────────────────────────────────────────────────
// Email Marketing Sequences — Phase 6
// Content definitions; delivery via Inngest + Resend
// ─────────────────────────────────────────────────────────────────────────────

export interface GrowthEmailStep {
    key: string;
    dayOffset: number;
    delayHours: number;
    subject: string;
    preview: string;
}

/**
 * Trial nurture: 5 emails on days 1, 2, 3, 5, 7 (blueprint).
 * Immediate welcome email is sent separately on signup (Day 1: Welcome + connect Google).
 */
export const TRIAL_NURTURE_STEPS: GrowthEmailStep[] = [
    {
        key: "trial_day1_connect_google",
        dayOffset: 1,
        delayHours: 24,
        subject: "Day 1: Connect Google and see every review in one inbox",
        preview: "Link your Google Business Profile in under 2 minutes.",
    },
    {
        key: "trial_day2_first_request",
        dayOffset: 2,
        delayHours: 48,
        subject: "Day 2: Send your first review request",
        preview: "SMS, email, or link — pick what fits your customers.",
    },
    {
        key: "trial_day3_ai_replies",
        dayOffset: 3,
        delayHours: 72,
        subject: "Day 3: Reply to reviews in one click with AI",
        preview: "Professional responses in your brand voice — you stay in control.",
    },
    {
        key: "trial_day5_competitors",
        dayOffset: 5,
        delayHours: 120,
        subject: "Day 5: See how you stack up against competitors",
        preview: "Track nearby businesses and close the review gap.",
    },
    {
        key: "trial_day7_upgrade",
        dayOffset: 7,
        delayHours: 168,
        subject: "Day 7: Your trial ends soon — keep your momentum",
        preview: "Plans from $29.99/mo. No annual contract.",
    },
];

/** Post-trial conversion drip */
export const ONBOARDING_DRIP_STEPS: GrowthEmailStep[] = [
    {
        key: "convert_benefits_recap",
        dayOffset: 0,
        delayHours: 2,
        subject: "Welcome to paid — here's everything you unlocked",
        preview: "AI replies, competitor tracking, and unlimited review requests on your plan.",
    },
    {
        key: "convert_case_study",
        dayOffset: 3,
        delayHours: 72,
        subject: "How Wolfpack BBQ added 64 five-star reviews in 60 days",
        preview: "A playbook you can copy this week.",
    },
    {
        key: "convert_pricing_reminder",
        dayOffset: 7,
        delayHours: 168,
        subject: "Getting the most from your Zyene plan",
        preview: "Tips to hit your monthly limits efficiently.",
    },
    {
        key: "convert_last_chance_offer",
        dayOffset: 14,
        delayHours: 336,
        subject: "Last chance: lock in your plan before limits reset",
        preview: "Stay on paid — keep AI replies, competitor tracking, and review automation.",
    },
];

/** Win-back sequence (supplements immediate cancel email) */
export const WINBACK_STEPS: GrowthEmailStep[] = [
    {
        key: "winback_day14",
        dayOffset: 14,
        delayHours: 336,
        subject: "We miss you — here's what's new at Zyene Reviews",
        preview: "New features since you left, plus 25% off if you come back.",
    },
];

export const NEWSLETTER_DESCRIPTION = {
    title: "Zyene Reviews Monthly",
    frequency: "Once per month",
    topics: ["Product updates", "Google review tips", "Industry insights", "New case studies"],
};
