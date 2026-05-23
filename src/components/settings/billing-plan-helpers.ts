import type { Plan } from "@/services/stripe/plans";
import { planProductTier } from "@/services/stripe/plans";

export function sameProductTier(a: Plan | null, b: Plan): boolean {
    if (!a) return false;
    if (a.id === "enterprise" || b.id === "enterprise") return a.id === b.id;
    const ta = planProductTier(a.id);
    const tb = planProductTier(b.id);
    return ta !== null && ta === tb;
}

export function formatRecurringLabel(plan: Plan): string {
    const suffix = plan.interval === "year" ? "/yr" : "/mo";
    const amount = plan.price != null ? plan.price.toFixed(2) : "—";
    return `$${amount}${suffix}`;
}
