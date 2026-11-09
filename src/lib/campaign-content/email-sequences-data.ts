// ─────────────────────────────────────────────────────────────────────────────
// Email Marketing Sequences - Phase 6
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
 * Trial nurture: 2 emails (day 2 and day 7). Day 1 (welcome + connect Google) is sent
 * on signup via welcome-email.ts. Stops as soon as the organization is on a paid plan.
 * There is deliberately no post-purchase drip or newsletter nurture: the plan welcome,
 * receipts and the monthly newsletter cover those people without extra mail.
 */
export const TRIAL_NURTURE_STEPS: GrowthEmailStep[] = [
    {
        key: "trial_day2_first_request",
        dayOffset: 2,
        delayHours: 24,
        subject: "Day 2: Send your first review request",
        preview: "SMS, email, or link - pick what fits your customers.",
    },
    {
        key: "trial_day7_upgrade",
        dayOffset: 7,
        delayHours: 168,
        subject: "Day 7: Review your plan and next steps",
        preview: "Plans from $29.99/mo. No annual contract.",
    },
];

/** Win-back sequence (supplements immediate cancel email) */
export const WINBACK_STEPS: GrowthEmailStep[] = [
    {
        key: "winback_day14",
        dayOffset: 14,
        delayHours: 336,
        subject: "We miss you - here's what's new at Zyene Reviews",
        preview: "Explore current plans and available features.",
    },
];

export const NEWSLETTER_DESCRIPTION = {
    title: "Zyene Reviews Monthly",
    frequency: "Once per month",
    topics: ["Product updates", "Google review tips", "Industry insights", "New case studies"],
};
