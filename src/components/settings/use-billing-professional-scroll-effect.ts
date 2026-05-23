"use client";

import { useEffect, useRef } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { Plan } from "@/services/stripe/plans";
import { BILLING_PLAN_PROFESSIONAL_ANCHOR_ID } from "@/lib/billing/business-limit-upgrade-href";

export function useBillingProfessionalScrollEffect(
    searchParams: ReadonlyURLSearchParams,
    interval: "month" | "year",
    plans: Plan[]
) {
    const hasScrolledToProfessionalRef = useRef(false);

    useEffect(() => {
        const status = searchParams.get("status");
        const error = searchParams.get("error");
        const hash = typeof window !== "undefined" ? window.location.hash.trim().toLowerCase() : "";
        const shouldScroll =
            status === "limit_reached" ||
            error === "limit_reached" ||
            hash === `#${BILLING_PLAN_PROFESSIONAL_ANCHOR_ID}` ||
            hash === "#professional";

        const proPlansForInterval = plans.filter(
            (p) => p.interval === interval && p.id !== "enterprise" && p.name === "Professional"
        );
        if (!shouldScroll || hasScrolledToProfessionalRef.current || proPlansForInterval.length === 0) {
            return;
        }

        let cancelled = false;
        const tryScroll = (attempt: number) => {
            if (cancelled) return;
            const el = document.getElementById(BILLING_PLAN_PROFESSIONAL_ANCHOR_ID);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
                hasScrolledToProfessionalRef.current = true;
                return;
            }
            if (attempt < 8) {
                window.setTimeout(() => tryScroll(attempt + 1), 120);
            }
        };

        const start = window.setTimeout(() => tryScroll(0), 80);
        return () => {
            cancelled = true;
            window.clearTimeout(start);
        };
    }, [searchParams, interval, plans]);
}
