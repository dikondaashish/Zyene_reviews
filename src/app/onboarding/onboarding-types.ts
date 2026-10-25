export interface OnboardingOrganization {
    id: string;
    name: string;
}

export interface OnboardingBusiness {
    id: string;
    name: string;
    city: string | null;
    category: string | null;
    /** Support Email; customer replies to review requests go here. */
    email?: string | null;
    address_line1?: string | null;
    state?: string | null;
    /** ISO two-letter code; the column defaults to US. */
    country?: string | null;
    phone?: string | null;
    website?: string | null;
    /** The public review link: collectratings.com/<slug>. */
    slug?: string | null;
    average_rating?: number | null;
    total_reviews?: number | null;
    /** Google photo URL for the preview only; never saved. */
    photoUrl?: string | null;
    /** True only when Google picked the industry in this session (profile category or place type). */
    categoryFromGoogle?: boolean;
}

export interface OnboardingUser {
    id: string;
    email?: string | null;
    /** Saved mobile number; empty for Google sign-ups until the About you step. */
    phone?: string | null;
    user_metadata?: {
        full_name?: string;
    };
}

/**
 * Step ids are what `users.onboarding_step` stores, so existing ids keep their meaning and the
 * new steps take new ids. The order owners see: about you (1), connect (2, 3), their results (6),
 * plan (4), automate (7, only once a plan allows it), all set (5). Step 1 used to name the
 * workspace; it now asks for a mobile number (Google sign-ups skip the signup form) and
 * business or agency. The workspace is named after the business when step 3 is saved.
 */
export const ONBOARDING_STEP = { about: 1, business: 2, details: 3, plan: 4, done: 5, results: 6, automate: 7 } as const;

export const ONBOARDING_PHASES = [
    { label: "About you", steps: [1] },
    { label: "Connect", steps: [2, 3] },
    { label: "Your results", steps: [6] },
    { label: "Plan", steps: [4] },
    { label: "Automate", steps: [7] },
    { label: "All set", steps: [5] },
] as const;

export function onboardingPhaseIndex(step: number): number {
    const index = ONBOARDING_PHASES.findIndex((phase) => (phase.steps as readonly number[]).includes(step));
    return index === -1 ? 0 : index;
}
