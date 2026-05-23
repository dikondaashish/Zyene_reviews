"use client";

import { useEffect, useState } from "react";
import type { FlowStep, PublicReviewFlowProps } from "./types";

export function useReviewFlowState(props: Pick<PublicReviewFlowProps, "isPreview" | "previewStep">) {
    const { isPreview = false, previewStep } = props;

    const [step, setStep] = useState<FlowStep>("rating");
    const [rating, setRating] = useState<number | null>(null);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customTagInput, setCustomTagInput] = useState("");
    const [addedCustomTags, setAddedCustomTags] = useState<string[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
    const [reviewText, setReviewText] = useState("");
    const [feedback, setFeedback] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (isPreview && previewStep) {
            setStep(previewStep);
        }
    }, [isPreview, previewStep]);

    return {
        step,
        setStep,
        rating,
        setRating,
        hoverRating,
        setHoverRating,
        selectedTags,
        setSelectedTags,
        showCustomInput,
        setShowCustomInput,
        customTagInput,
        setCustomTagInput,
        addedCustomTags,
        setAddedCustomTags,
        selectedStaff,
        setSelectedStaff,
        reviewText,
        setReviewText,
        feedback,
        setFeedback,
        customerEmail,
        setCustomerEmail,
        customerPhone,
        setCustomerPhone,
        isSubmitting,
        setIsSubmitting,
        isRedirecting,
        setIsRedirecting,
        progress,
        setProgress,
        mounted,
    };
}
