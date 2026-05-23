"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Review } from "@/components/reviews/review-card-types";

export function useReviewCardSubmit(
    review: Review,
    replyText: string,
    isEditingReply: boolean,
    stopAiStream: () => void,
    onSuccess: () => void,
    onAiLimitOrPlan: (kind: "limit" | "plan") => void,
    onRefresh?: () => void
) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (!replyText.trim()) return;
        stopAiStream();
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/reviews/${review.id}/reply`, {
                method: "POST",
                body: JSON.stringify({ text: replyText }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to reply");

            toast.success(isEditingReply ? "Reply updated" : "Reply posted successfully");
            onSuccess();
            if (onRefresh) onRefresh();
            else router.refresh();
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "An unexpected error occurred";
            if (message.includes("Monthly AI reply limit reached") || message.includes("upgrade your plan")) {
                onAiLimitOrPlan("limit");
            } else {
                toast.error(message);
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [
        replyText,
        review.id,
        isEditingReply,
        stopAiStream,
        onSuccess,
        onRefresh,
        router,
        onAiLimitOrPlan,
    ]);

    return { isSubmitting, handleSubmit };
}
