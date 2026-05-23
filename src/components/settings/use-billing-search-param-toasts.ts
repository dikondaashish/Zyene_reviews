"use client";

import { useEffect } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { toast } from "sonner";

export function useBillingSearchParamToasts(
    searchParams: ReadonlyURLSearchParams,
    router: { replace: (href: string) => void }
) {
    useEffect(() => {
        const success = searchParams.get("success");
        const canceled = searchParams.get("canceled");
        const status = searchParams.get("status");

        if (success === "true") {
            toast.success("Subscription updated", {
                description: "Your plan and billing are up to date.",
            });
            router.replace("/settings/billing");
        } else if (canceled === "true") {
            toast.info("Checkout canceled", {
                description: "No charges were made. You can subscribe anytime.",
            });
            router.replace("/settings/billing");
        } else if (status === "limit_reached" || searchParams.get("error") === "limit_reached") {
            toast.error("Business limit reached", {
                description:
                    "You've reached the maximum number of businesses for your current plan. Upgrade to add more locations.",
                duration: 6000,
            });
        }
    }, [searchParams, router]);
}
