"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Review, ReviewCardTone } from "@/components/reviews/review-card-types";
import { useReviewCardAiStream } from "@/components/reviews/use-review-card-ai-stream";
import { useReviewCardSubmit } from "@/components/reviews/use-review-card-submit";

export function useReviewCardReply(
    review: Review,
    planAllowsAiReplies: boolean,
    onRefresh?: () => void
) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeModalKind, setUpgradeModalKind] = useState<"limit" | "plan">("limit");
    const [isEditingReply, setIsEditingReply] = useState(false);
    const [activeTone, setActiveTone] = useState<ReviewCardTone | null>(null);
    const [loadingTone, setLoadingTone] = useState<ReviewCardTone | null>(null);
    const [toneCache, setToneCache] = useState<Partial<Record<ReviewCardTone, string>>>({});

    const { isAiTyping, stopAiStream, startAiStream } = useReviewCardAiStream(setReplyText);

    const resetAfterSubmit = useCallback(() => {
        setIsReplying(false);
        setIsEditingReply(false);
        setReplyText("");
        setActiveTone(null);
        setToneCache({});
    }, []);

    const onAiLimitOrPlan = useCallback((kind: "limit" | "plan") => {
        setUpgradeModalKind(kind);
        setShowUpgradeModal(true);
    }, []);

    const { isSubmitting, handleSubmit } = useReviewCardSubmit(
        review,
        replyText,
        isEditingReply,
        stopAiStream,
        resetAfterSubmit,
        onAiLimitOrPlan,
        onRefresh
    );

    const handleReplyTextChange = useCallback(
        (value: string) => {
            if (isAiTyping) stopAiStream();
            setReplyText(value);
        },
        [isAiTyping, stopAiStream]
    );

    const handleToneClick = useCallback(
        async (tone: ReviewCardTone) => {
            stopAiStream();

            if (!planAllowsAiReplies) {
                onAiLimitOrPlan("plan");
                return;
            }

            if (toneCache[tone]) {
                setActiveTone(tone);
                setReplyText(toneCache[tone]!);
                return;
            }

            if (!isReplying && !isEditingReply) setIsReplying(true);
            setActiveTone(tone);
            setLoadingTone(tone);

            try {
                const res = await fetch("/api/ai/suggest-reply", {
                    method: "POST",
                    body: JSON.stringify({ reviewId: review.id, tone }),
                });
                const json = await res.json();
                if (!res.ok) {
                    if (json?.code === "AI_REPLY_PLAN_REQUIRED") {
                        onAiLimitOrPlan("plan");
                        return;
                    }
                    throw new Error(json.error || "Failed to get suggestion");
                }

                const payload = json.data || json;
                const reply = payload.reply || "";

                setToneCache((prev) => ({ ...prev, [tone]: reply }));
                setLoadingTone(null);
                startAiStream(reply);
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : "An unexpected error occurred";
                if (message.includes("Monthly AI reply limit reached") || message.includes("upgrade your plan")) {
                    onAiLimitOrPlan("limit");
                } else {
                    toast.error(message);
                }
            } finally {
                setLoadingTone(null);
            }
        },
        [planAllowsAiReplies, isReplying, isEditingReply, toneCache, review.id, stopAiStream, startAiStream, onAiLimitOrPlan]
    );

    const startEditReply = useCallback(() => {
        stopAiStream();
        setIsEditingReply(true);
        setReplyText(review.response_text || "");
        setActiveTone(null);
        setToneCache({});
    }, [review.response_text, stopAiStream]);

    const cancelReplyComposer = useCallback(() => {
        stopAiStream();
        setIsReplying(false);
        setIsEditingReply(false);
        setReplyText("");
        setActiveTone(null);
        setToneCache({});
    }, [stopAiStream]);

    return {
        isReplying,
        setIsReplying,
        replyText,
        isSubmitting,
        showUpgradeModal,
        setShowUpgradeModal,
        upgradeModalKind,
        isEditingReply,
        isAiTyping,
        activeTone,
        loadingTone,
        handleSubmit,
        handleReplyTextChange,
        handleToneClick,
        startEditReply,
        cancelReplyComposer,
    };
}
