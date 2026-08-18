import { hasActiveOrTrialingStatus, planProductTier } from "@/services/stripe/plan-entitlements";

const ACTIVE_PROMPT_LIMITS = {
    starter: 5,
    professional: 15,
    enterprise: 25,
} as const;

export function activePromptLimitForPlan(
    plan: string | null | undefined,
    planStatus: string | null | undefined
): number {
    if (!hasActiveOrTrialingStatus(planStatus)) return 0;
    const tier = planProductTier(plan);
    return tier ? ACTIVE_PROMPT_LIMITS[tier] : 0;
}
