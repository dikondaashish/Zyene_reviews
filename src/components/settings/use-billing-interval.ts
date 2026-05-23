"use client";

import { useState, useEffect } from "react";
import type { Plan } from "@/services/stripe/plans";

export function useBillingInterval(currentPlan: Plan | null) {
    const [interval, setInterval] = useState<"month" | "year">(() =>
        currentPlan?.interval === "year" ? "year" : "month"
    );

    useEffect(() => {
        if (currentPlan?.interval === "month" || currentPlan?.interval === "year") {
            setInterval(currentPlan.interval);
        }
    }, [currentPlan?.id, currentPlan?.interval]);

    return { interval, setInterval };
}
