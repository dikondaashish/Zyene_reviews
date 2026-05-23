"use client";

import { useCallback } from "react";
import type { FlowStep, PrivateFeedbackContactMode, PublicReviewFlowProps } from "./types";
import { useReviewFlowGenerate } from "./use-review-flow-generate";
import { useReviewFlowGooglePost } from "./use-review-flow-google-post";
import { useReviewFlowNegativeSubmit } from "./use-review-flow-negative-submit";

type ReviewFlowActionsConfig = Pick<
    PublicReviewFlowProps,
    "businessId" | "businessName" | "googleUrl"
> & {
    isPreview: boolean;
    minStars: number;
    categoryKey: string;
    rating: number | null;
    selectedTags: string[];
    addedCustomTags: string[];
    selectedStaff: string[];
    reviewText: string;
    feedback: string;
    customerEmail: string;
    customerPhone: string;
    activeRequestId: string | undefined;
    requestId: string | undefined;
    ensureActiveRequestId: () => Promise<string | undefined>;
    trackRequestUpdate: (trackData: Record<string, unknown>) => Promise<void>;
    setStep: React.Dispatch<React.SetStateAction<FlowStep>>;
    setRating: React.Dispatch<React.SetStateAction<number | null>>;
    setReviewText: React.Dispatch<React.SetStateAction<string>>;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    setIsRedirecting: React.Dispatch<React.SetStateAction<boolean>>;
    setProgress: React.Dispatch<React.SetStateAction<number>>;
    setCustomerPhone: React.Dispatch<React.SetStateAction<string>>;
    privateFeedbackEmailMode: PrivateFeedbackContactMode;
    privateFeedbackPhoneMode: PrivateFeedbackContactMode;
};

export function useReviewFlowActions(config: ReviewFlowActionsConfig) {
    const {
        minStars,
        trackRequestUpdate,
        setStep,
        setRating,
    } = config;

    const handleRate = useCallback(
        (stars: number) => {
            setRating(stars);
            void trackRequestUpdate({
                rating_given: stars,
                status: stars >= minStars ? "rated_positive" : "rated_negative",
            });
            setTimeout(() => {
                if (stars >= minStars) {
                    setStep("tags");
                } else {
                    setStep("negative");
                }
            }, 400);
        },
        [minStars, setRating, setStep, trackRequestUpdate]
    );

    const generate = useReviewFlowGenerate(config);
    const googlePost = useReviewFlowGooglePost(config);
    const negativeSubmit = useReviewFlowNegativeSubmit(config);

    return {
        handleRate,
        ...generate,
        ...googlePost,
        ...negativeSubmit,
    };
}
