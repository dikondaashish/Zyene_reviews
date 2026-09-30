"use client";

import { useCallback } from "react";
import { ensureCompleteReviewText } from "@/lib/review-flow/ensure-complete-review";
import { buildTagsSelected } from "@/lib/review-flow/tags-for-ai";
import type { FlowStep } from "./types";

export function useReviewFlowGenerate(options: {
    isPreview: boolean;
    businessId: string;
    businessName: string;
    categoryKey: string;
    rating: number | null;
    selectedTags: string[];
    addedCustomTags: string[];
    selectedStaff: string[];
    ensureActiveRequestId: () => Promise<string | undefined>;
    getTrackingToken: () => string | undefined;
    setStep: React.Dispatch<React.SetStateAction<FlowStep>>;
    setReviewText: React.Dispatch<React.SetStateAction<string>>;
}) {
    const {
        isPreview,
        businessId,
        businessName,
        categoryKey,
        rating,
        selectedTags,
        addedCustomTags,
        selectedStaff,
        ensureActiveRequestId,
        getTrackingToken,
        setStep,
        setReviewText,
    } = options;

    const handleGenerateReview = useCallback(async () => {
        setStep("generating");

        if (isPreview) {
            setTimeout(() => {
                setReviewText(
                    `[PREVIEW] Great experience at ${businessName}! Really loved the ${selectedTags[0] || "service"}.`
                );
                setStep("review");
            }, 1500);
            return;
        }

        try {
            const requestIdToUse = await ensureActiveRequestId();
            const token = getTrackingToken();
            if (!requestIdToUse || !token) throw new Error("Review link unavailable");
            const res = await fetch("/api/review-flow/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reviewRequestId: requestIdToUse,
                    businessId,
                    token,
                    businessName,
                    businessCategory: categoryKey,
                    rating,
                    selectedTags: buildTagsSelected(selectedTags, addedCustomTags),
                    selectedStaff,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate");

            setReviewText(ensureCompleteReviewText(data.reviewText ?? "", businessName));
            setStep("review");
        } catch (error) {
            const firstTag = selectedTags[0]?.replace(/^[^\s]+\s/, "") || "experience";
            setReviewText(
                ensureCompleteReviewText(
                    `Great experience at ${businessName}! Really loved the ${firstTag.toLowerCase()}. Would definitely come back.`,
                    businessName
                )
            );
            setStep("review");
        }
    }, [
        addedCustomTags,
        businessId,
        businessName,
        categoryKey,
        ensureActiveRequestId,
        getTrackingToken,
        isPreview,
        rating,
        selectedStaff,
        selectedTags,
        setReviewText,
        setStep,
    ]);

    const handleTagsContinue = useCallback(() => {
        void handleGenerateReview();
    }, [handleGenerateReview]);

    return { handleGenerateReview, handleTagsContinue };
}
