"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useReviewsPageClientBackfill(businessId: string) {
    const [isBackfillingAi, setIsBackfillingAi] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const handleBackfillAi = useCallback(async () => {
        setIsBackfillingAi(true);
        try {
            const response = await fetch("/api/smart/analyze/backfill", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ limit: 1500, businessId }),
            });
            const payload = await response.json();
            if (!response.ok) {
                if (payload?.code === "AI_ANALYSIS_PLAN_REQUIRED") {
                    setShowUpgradeModal(true);
                    return;
                }
                throw new Error(payload?.error || "Failed to queue AI analysis");
            }
            const queued = payload?.data?.queued ?? payload?.queued ?? 0;
            if (queued > 0) {
                toast.success(`Queued AI analysis for ${queued} reviews.`);
            } else {
                toast.info("No pending reviews need AI analysis.");
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to queue AI analysis";
            toast.error(message);
        } finally {
            setIsBackfillingAi(false);
        }
    }, [businessId]);

    return { isBackfillingAi, showUpgradeModal, setShowUpgradeModal, handleBackfillAi };
}
