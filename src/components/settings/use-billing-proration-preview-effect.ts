"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { Plan } from "@/services/stripe/plans";
import type { ProrationPreviewState } from "@/components/settings/billing-client-types";

export function useBillingProrationPreviewEffect(
    confirmPlanChange: { priceId: string; plan: Plan } | null,
    setProrationPreview: Dispatch<SetStateAction<ProrationPreviewState>>
) {
    useEffect(() => {
        if (!confirmPlanChange) {
            return;
        }
        const ac = new AbortController();
        void (async () => {
            try {
                const res = await fetch("/api/billing/proration-preview", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ priceId: confirmPlanChange.priceId }),
                    signal: ac.signal,
                });
                const json: unknown = await res.json();
                if (ac.signal.aborted) {
                    return;
                }
                const root = json as {
                    success?: boolean;
                    data?: { previewAvailable?: boolean; amountDueTodayFormatted?: string };
                };
                if (!res.ok || root.success !== true || !root.data) {
                    setProrationPreview("fallback");
                    return;
                }
                const d = root.data;
                if (d.previewAvailable === true && typeof d.amountDueTodayFormatted === "string") {
                    setProrationPreview({ amountFormatted: d.amountDueTodayFormatted });
                } else {
                    setProrationPreview("fallback");
                }
            } catch {
                if (!ac.signal.aborted) {
                    setProrationPreview("fallback");
                }
            }
        })();
        return () => ac.abort();
    }, [confirmPlanChange]);
}
