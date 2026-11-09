/**
 * Decides what the dashboard trial banner shows.
 *
 * Stripe trials are paid-plan trials: billing sync stores `plan_status = "trialing"`,
 * the paid plan id in `plan`, and `trial_ends_at` only while the subscription is
 * trialing. The banner keys off that status, never off `plan === "free"`.
 */

/** How long after `trial_ends_at` a still-"trialing" row keeps the banner (webhook lag). */
export const TRIAL_ENDED_GRACE_MS = 7 * 24 * 60 * 60 * 1000;

/** Within this window the countdown switches to "ending soon" styling. */
export const TRIAL_ENDING_SOON_MS = 3 * 24 * 60 * 60 * 1000;

export interface TrialBannerInput {
    planStatus?: string | null;
    trialEndsAt?: string | null;
}

export type TrialBannerPhase = "active" | "ending_soon" | "ended";

export interface TrialBannerState {
    phase: TrialBannerPhase;
    trialEndsAt: Date;
}

export function getTrialBannerState(
    input: TrialBannerInput | null | undefined,
    now: Date = new Date()
): TrialBannerState | null {
    if (!input || input.planStatus !== "trialing" || !input.trialEndsAt) return null;

    const trialEndsAt = new Date(input.trialEndsAt);
    const endsMs = trialEndsAt.getTime();
    if (Number.isNaN(endsMs)) return null;

    const remainingMs = endsMs - now.getTime();
    if (remainingMs <= 0) {
        return -remainingMs <= TRIAL_ENDED_GRACE_MS ? { phase: "ended", trialEndsAt } : null;
    }
    return { phase: remainingMs <= TRIAL_ENDING_SOON_MS ? "ending_soon" : "active", trialEndsAt };
}
