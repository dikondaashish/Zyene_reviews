"use client";

import { useCallback } from "react";
import { ensureCompleteReviewText } from "@/lib/review-flow/ensure-complete-review";
import { buildTagsSelected, fallbackHighlights } from "@/lib/review-flow/tags-for-ai";
import type { FlowStep } from "./types";
import { DEFAULT_MIN_STARS_FOR_GOOGLE, fallbackReviewText } from "@/lib/review-flow/rating-tone";

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
                // Same rating-aware text customers would see if drafting fell back, so the editor preview is honest.
                const highlights = fallbackHighlights(buildTagsSelected(selectedTags, addedCustomTags));
                setReviewText(`[PREVIEW] ${fallbackReviewText(businessName, highlights, rating ?? DEFAULT_MIN_STARS_FOR_GOOGLE)}`);
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
        } catch {
            // Same rating-aware template as the server's fallback, so a 3-star review never reads as gushing.
            const highlights = fallbackHighlights(buildTagsSelected(selectedTags, addedCustomTags));
            setReviewText(ensureCompleteReviewText(fallbackReviewText(businessName, highlights, rating ?? DEFAULT_MIN_STARS_FOR_GOOGLE), businessName));
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
