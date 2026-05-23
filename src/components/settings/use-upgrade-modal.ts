"use client";

import { useState } from "react";
import { toast } from "sonner";

import { parseBillingCheckoutResponse } from "@/lib/billing/parse-checkout-response";
import { PLANS } from "@/services/stripe/plans";

export function useUpgradeModal(onClose: () => void) {
    const [interval, setInterval] = useState<"month" | "year">("month");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const displayPlans = PLANS.filter((p) => p.interval === interval && p.id !== "enterprise");
    const intervalLabel = interval === "month" ? "/mo" : "/yr";
    const monthlyStarterPrice = PLANS.find((p) => p.id === "starter_monthly")?.price ?? 0;
    const yearlyStarterPrice = PLANS.find((p) => p.id === "starter_yearly")?.price ?? 0;
    const yearlySavings =
        monthlyStarterPrice > 0 ? Math.round((1 - yearlyStarterPrice / (monthlyStarterPrice * 12)) * 100) : 0;

    async function handleSubscribe(priceId: string) {
        setLoadingPlan(priceId);
        try {
            const res = await fetch("/api/billing/checkout", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId, source: "billing" }),
            });
            const json = await res.json();
            const parsed = parseBillingCheckoutResponse(json);

            if (!res.ok || !parsed.ok) {
                throw new Error(parsed.error || "Checkout failed");
            }

            const payload = parsed.payload;
            if (payload?.switched && payload.url) {
                toast.success("Plan updated", {
                    description: "Redirecting to confirm your subscription…",
                });
                onClose();
                window.location.assign(payload.url);
            } else if (payload?.url) {
                window.location.assign(payload.url);
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to start checkout");
        } finally {
            setLoadingPlan(null);
        }
    }

    return {
        interval,
        setInterval,
        loadingPlan,
        displayPlans,
        intervalLabel,
        yearlySavings,
        handleSubscribe,
    };
}
