"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { buildTagsSelected } from "@/lib/review-flow/tags-for-ai";
import type { FlowStep } from "./types";

export function useReviewFlowGooglePost(options: {
    isPreview: boolean;
    googleUrl?: string;
    rating: number | null;
    selectedTags: string[];
    addedCustomTags: string[];
    selectedStaff: string[];
    reviewText: string;
    trackRequestUpdate: (trackData: Record<string, unknown>) => Promise<void>;
    setStep: React.Dispatch<React.SetStateAction<FlowStep>>;
    setIsRedirecting: React.Dispatch<React.SetStateAction<boolean>>;
    setProgress: React.Dispatch<React.SetStateAction<number>>;
}) {
    const {
        isPreview,
        googleUrl,
        rating,
        selectedTags,
        addedCustomTags,
        selectedStaff,
        reviewText,
        trackRequestUpdate,
        setStep,
        setIsRedirecting,
        setProgress,
    } = options;

    const handlePostToGoogle = useCallback(async () => {
        if (isPreview) {
            toast.info("Preview Mode: This would open Google Maps.");
            setStep("thankyou");
            return;
        }

        try {
            await navigator.clipboard.writeText(reviewText);
            toast.success("Review copied!", { duration: 2000 });
        } catch {
            toast.info("Tap and hold the review text to copy it.");
        }

        setIsRedirecting(true);
        setTimeout(() => setProgress(100), 50);

        try {
            const trackData = {
                status: "completed",
                review_left: true,
                rating_given: rating,
                tags_selected: buildTagsSelected(selectedTags, addedCustomTags),
                ai_review_text: reviewText,
                completed_at: new Date().toISOString(),
                selected_staff: selectedStaff,
            };

            await trackRequestUpdate(trackData);
        } catch (err) {
        }

        setTimeout(() => {
            if (googleUrl) {
                window.location.href = googleUrl;
            } else {
                setStep("thankyou");
            }
        }, 2050);
    }, [
        addedCustomTags,
        googleUrl,
        isPreview,
        rating,
        reviewText,
        selectedStaff,
        selectedTags,
        setIsRedirecting,
        setProgress,
        setStep,
        trackRequestUpdate,
    ]);

    return { handlePostToGoogle };
}
