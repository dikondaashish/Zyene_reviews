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
    activeRequestId: string | undefined;
    ensureActiveRequestId: () => Promise<string | undefined>;
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
        activeRequestId,
        ensureActiveRequestId,
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
            const requestIdToUse = activeRequestId ?? (await ensureActiveRequestId());
            const res = await fetch("/api/review-flow/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reviewRequestId: requestIdToUse,
                    businessId,
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
        activeRequestId,
        addedCustomTags,
        businessId,
        businessName,
        categoryKey,
        ensureActiveRequestId,
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
