import { PLANS } from "@/services/stripe/plans";

export function step4YearlySavingsPercent(): number {
    const monthlyStarterPrice = PLANS.find((p) => p.id === "starter_monthly")?.price ?? 0;
    const yearlyStarterPrice = PLANS.find((p) => p.id === "starter_yearly")?.price ?? 0;
    if (monthlyStarterPrice <= 0) return 0;
    return Math.round((1 - yearlyStarterPrice / (monthlyStarterPrice * 12)) * 100);
}
