"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PastDueBillingAlert } from "@/components/billing/past-due-billing-alert";

export interface PastDuePaymentBannerProps {
    planStatus: string | null | undefined;
    stripeCustomerId: string | null | undefined;
    canManageBilling: boolean;
}

export function PastDuePaymentBanner({
    planStatus,
    stripeCustomerId,
    canManageBilling,
}: PastDuePaymentBannerProps) {
    const router = useRouter();
    const [loadingPortal, setLoadingPortal] = useState(false);

    if (String(planStatus || "").toLowerCase().trim() !== "past_due") {
        return null;
    }

    const hasStripeCustomer = typeof stripeCustomerId === "string" && stripeCustomerId.length > 0;
    const canUsePortal = canManageBilling && hasStripeCustomer;

    async function openPortal() {
        if (!canManageBilling) {
            toast.error("You don't have permission to manage billing. Contact your organization owner.");
            router.push("/settings/billing");
            return;
        }
        setLoadingPortal(true);
        try {
            const res = await fetch("/api/billing/portal", { method: "POST", credentials: "include" });
            const data = (await res.json()) as { error?: string; url?: string };
            if (!res.ok) {
                throw new Error(typeof data.error === "string" ? data.error : "Failed to open billing portal");
            }
            if (data.url) window.location.href = data.url;
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to open billing portal");
        } finally {
            setLoadingPortal(false);
        }
    }

    return (
        <PastDueBillingAlert
            layout="banner"
            action={{
                label: canUsePortal ? "Update payment" : "View billing",
                disabled: canUsePortal ? !hasStripeCustomer : false,
                loading: loadingPortal,
                onClick: () => void (canUsePortal ? openPortal() : router.push("/settings/billing")),
            }}
        />
    );
}
