"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { parseBillingCheckoutResponse } from "@/lib/billing/parse-checkout-response";

export function useBillingCheckout(canManageBilling: boolean, noBillingPermissionMessage: string) {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleSubscribe = useCallback(
        async (priceId: string) => {
            if (!canManageBilling) {
                toast.error(noBillingPermissionMessage);
                return;
            }
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
                    throw new Error(parsed.error || "Failed to start checkout");
                }

                const payload = parsed.payload;

                if (payload?.switched && payload.url) {
                    toast.success("Plan updated", {
                        description: "Your subscription has been updated. Redirecting…",
                    });
                    window.location.assign(payload.url);
                    return;
                }
                if (payload?.url) {
                    window.location.assign(payload.url);
                } else {
                    throw new Error("No checkout URL returned");
                }
            } catch (error: unknown) {
                toast.error(error instanceof Error ? error.message : "Failed to start checkout");
            } finally {
                setLoadingPlan(null);
            }
        },
        [canManageBilling, noBillingPermissionMessage]
    );

    return { loadingPlan, handleSubscribe };
}
