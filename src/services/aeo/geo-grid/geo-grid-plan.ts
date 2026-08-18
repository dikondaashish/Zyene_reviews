import { getEngineDescriptor } from "@/services/aeo/engines/engine-catalog";
import { hasActiveOrTrialingStatus, planProductTier } from "@/services/stripe/plan-entitlements";

export type GeoGridSize = 5 | 7 | 9;
export type GeoGridSpacingMiles = 0.5 | 1 | 2;

export function estimateGeoGridCostMicroUsd(size: GeoGridSize): number {
    return size * size * getEngineDescriptor("google_serp").cost.overageMicroUsd;
}

export function maxGeoGridSizeForPlan(
    plan: string | null | undefined,
    planStatus: string | null | undefined
): GeoGridSize | 0 {
    if (!hasActiveOrTrialingStatus(planStatus)) return 0;
    const tier = planProductTier(plan);
    if (tier === "starter") return 5;
    if (tier === "professional") return 7;
    return tier === "enterprise" ? 9 : 0;
}

export function spacingMilesToMeters(miles: GeoGridSpacingMiles): number {
    return Math.round(miles * 1_609.344);
}
