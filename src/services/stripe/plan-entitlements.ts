/**
 * What each plan unlocks — tier comparison and feature gating.
 *
 * Separate from plan-catalog.ts on purpose: pricing/packaging changes and
 * entitlement changes ship for different reasons and rarely together.
 *
 * These read `organizations.plan`, which stores Stripe plan ids
 * (`starter_monthly`, `professional_yearly`, …) — not display names. Every gate
 * here must stay in sync with the `organizations.plan` CHECK constraint and the
 * values the Stripe webhook writes.
 */
import { FREE_LIMITS } from "./plan-catalog";

export type PlanTier = "starter" | "professional" | "enterprise";

const PAID_TIER_ORDER: Record<PlanTier, number> = {
    starter: 1,
    professional: 2,
    enterprise: 3,
};

/** Same product family (monthly vs yearly cards share a tier). */
export function planProductTier(planId: string | null | undefined): PlanTier | null {
    if (planId == null || planId === "") return null;
    const id = String(planId).toLowerCase();
    if (id === "enterprise") return "enterprise";
    if (id.startsWith("starter_") || id === "starter") return "starter";
    if (id.startsWith("professional_") || id === "pro") return "professional";
    return null;
}

/** True when moving to a higher SMB tier (e.g. Starter → Professional). Same-tier interval changes are false. */
export function isPaidPlanTierUpgrade(
    fromPlanId: string | null | undefined,
    toPlanId: string | null | undefined
): boolean {
    const from = planProductTier(fromPlanId);
    const to = planProductTier(toPlanId);
    if (!from || !to) return false;
    return PAID_TIER_ORDER[to] > PAID_TIER_ORDER[from];
}

/** True when moving to a lower SMB tier (e.g. Professional → Starter). Used for proration_behavior = none at period boundaries. */
export function isPaidPlanTierDowngrade(
    fromPlanId: string | null | undefined,
    toPlanId: string | null | undefined
): boolean {
    const from = planProductTier(fromPlanId);
    const to = planProductTier(toPlanId);
    if (!from || !to) return false;
    return PAID_TIER_ORDER[to] < PAID_TIER_ORDER[from];
}

export function hasActiveOrTrialingStatus(planStatus: string | null | undefined): boolean {
    if (!planStatus) return false;
    const status = String(planStatus).toLowerCase().trim();
    return status === "active" || status === "trialing";
}

/**
 * Auto commenter + AI suggest-reply: allowed for paid SMB tiers and agency/growth plans.
 */
export function planAllowsAutoCommenter(
    plan: string | null | undefined,
    planStatus?: string | null
): boolean {
    if (planStatus !== undefined && !hasActiveOrTrialingStatus(planStatus)) return false;
    if (plan == null || plan === "") return false;
    const p = String(plan).toLowerCase().trim();
    if (p === "free" || p === "none") return false;
    if (p === "enterprise") return true;
    if (p === "growth") return true;
    if (p === "agency_starter" || p === "agency_pro" || p === "agency_scale") return true;
    if (p === "starter" || p === "pro") return true;
    if (p.startsWith("starter_")) return true;
    if (p.startsWith("professional_")) return true;
    return false;
}

/**
 * Public embed widget (/w/...) and similar surfaces: paid SKU (same rules as auto-commenter,
 * e.g. starter_monthly, professional_yearly, enterprise, growth, agency_*) plus active/trialing status.
 * Do not use a short allowlist of display names — DB stores Stripe plan ids.
 */
export function planAllowsPublicReviewWidget(
    plan: string | null | undefined,
    planStatus: string | null | undefined
): boolean {
    if (!hasActiveOrTrialingStatus(planStatus)) return false;
    return planAllowsAutoCommenter(plan);
}

/**
 * Strict eligibility for AI review features requested by product:
 * Starter / Professional / Enterprise + active/trialing subscription status.
 */
export function planAllowsAiReviewFeatures(
    plan: string | null | undefined,
    planStatus: string | null | undefined
): boolean {
    const tier = planProductTier(plan);
    if (!tier) return false;
    return hasActiveOrTrialingStatus(planStatus);
}

/**
 * Team seat cap by subscription family.
 * - Starter: 5
 * - Professional: 15
 * - Enterprise: unlimited (-1)
 * Non-active/trialing subscriptions fall back to unsubscribed/free seats.
 */
export function teamMemberLimitForPlan(
    plan: string | null | undefined,
    planStatus: string | null | undefined
): number {
    const tier = planProductTier(plan);
    if (!tier || !hasActiveOrTrialingStatus(planStatus)) {
        return FREE_LIMITS.teamMembers;
    }
    if (tier === "starter") return 5;
    if (tier === "professional") return 15;
    return -1;
}
