"use client";

import { FormEvent, useCallback } from "react";
import { toast } from "sonner";
import { parseReviewRefFromSearch } from "./helpers";
import { negativeContactValid } from "./negative-contact-validation";
import type { FlowStep, PrivateFeedbackContactMode } from "./types";

export function useReviewFlowNegativeSubmit(options: {
    isPreview: boolean;
    businessId: string;
    rating: number | null;
    feedback: string;
    customerEmail: string;
    customerPhone: string;
    selectedStaff: string[];
    activeRequestId: string | undefined;
    requestId: string | undefined;
    privateFeedbackEmailMode: PrivateFeedbackContactMode;
    privateFeedbackPhoneMode: PrivateFeedbackContactMode;
    trackRequestUpdate: (trackData: Record<string, unknown>) => Promise<void>;
    setStep: React.Dispatch<React.SetStateAction<FlowStep>>;
    setRating: React.Dispatch<React.SetStateAction<number | null>>;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    setCustomerPhone: React.Dispatch<React.SetStateAction<string>>;
}) {
    const {
        isPreview,
        businessId,
        rating,
        feedback,
        customerEmail,
        customerPhone,
        selectedStaff,
        activeRequestId,
        requestId,
        privateFeedbackEmailMode,
        privateFeedbackPhoneMode,
        trackRequestUpdate,
        setStep,
        setRating,
        setIsSubmitting,
        setCustomerPhone,
    } = options;

    const handleSubmitFeedback = useCallback(async () => {
        if (!rating) return;

        if (isPreview) {
            toast.info("Preview Mode: Feedback submitted.");
            setStep("thankyou");
            return;
        }

        if (
            !negativeContactValid(
                customerEmail,
                customerPhone,
                privateFeedbackEmailMode,
                privateFeedbackPhoneMode
            )
        ) {
            toast.error("Please check the contact fields.", {
                description: "Fill in a valid email and/or phone where required.",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/reviews/private", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    business_id: businessId,
                    review_request_id: activeRequestId ?? requestId ?? parseReviewRefFromSearch(),
                    rating,
                    content: feedback,
                    customer_email: customerEmail.trim() || null,
                    customer_phone: customerPhone.trim() || null,
                    selected_staff: selectedStaff,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(typeof data.error === "string" ? data.error : "Failed to submit feedback");
            }

            await trackRequestUpdate({
                review_left: true,
                rating_given: rating,
                selected_staff: selectedStaff,
                status: "feedback_left",
                completed_at: new Date().toISOString(),
            });

            setStep("thankyou");
            toast.success("Thank you!", {
                description: "Your feedback has been received.",
            });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to submit feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }, [
        activeRequestId,
        businessId,
        customerEmail,
        customerPhone,
        feedback,
        isPreview,
        privateFeedbackEmailMode,
        privateFeedbackPhoneMode,
        rating,
        requestId,
        selectedStaff,
        setIsSubmitting,
        setStep,
        trackRequestUpdate,
    ]);

    const handleNegativeFormSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void handleSubmitFeedback();
        },
        [handleSubmitFeedback]
    );

    const resetToRatingFromNegative = useCallback(() => {
        setRating(null);
        setCustomerPhone("");
        setStep("rating");
    }, [setCustomerPhone, setRating, setStep]);

    return {
        handleSubmitFeedback,
        handleNegativeFormSubmit,
        resetToRatingFromNegative,
    };
}
