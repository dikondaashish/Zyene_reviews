"use client";

import { useMemo } from "react";
import { negativeContactValid } from "./negative-contact-validation";
import {
    buildReviewFlowDerived,
    buildReviewFlowShellProps,
    resolveReviewFlowBrandColor,
    resolveReviewFlowPageBackdrop,
} from "./review-flow-derived";
import type { PublicReviewFlowProps } from "./types";
import { useReviewFlowActions } from "./use-review-flow-actions";
import { useReviewFlowState } from "./use-review-flow-state";
import { useReviewFlowTagHandlers } from "./use-review-flow-tag-handlers";
import { useReviewFlowTracking } from "./use-review-flow-tracking";

export function useReviewFlow(props: PublicReviewFlowProps) {
    const {
        businessId,
        requestId,
        isPreview = false,
        privateFeedbackEmailMode = "optional",
        privateFeedbackPhoneMode = "hidden",
    } = props;

    const resolvedBrandColor = resolveReviewFlowBrandColor(props.brandColor);
    const minStars = props.minStars ?? 4;
    const { pageBgHex, useCustomPageBackdrop } = resolveReviewFlowPageBackdrop(props.reviewPageBackgroundColor);

    const state = useReviewFlowState({ isPreview, previewStep: props.previewStep });
    const { activeRequestId, ensureActiveRequestId, trackRequestUpdate } = useReviewFlowTracking(
        businessId,
        requestId,
        isPreview
    );

    const { categoryKey, tags, initials, hasTagSelection } = buildReviewFlowDerived(
        props,
        state.selectedTags,
        state.addedCustomTags
    );

    const tagHandlers = useReviewFlowTagHandlers({
        customTagInput: state.customTagInput,
        setSelectedTags: state.setSelectedTags,
        setAddedCustomTags: state.setAddedCustomTags,
        setCustomTagInput: state.setCustomTagInput,
        setShowCustomInput: state.setShowCustomInput,
        setSelectedStaff: state.setSelectedStaff,
        trackRequestUpdate,
    });

    const actions = useReviewFlowActions({
        businessId,
        businessName: props.businessName,
        googleUrl: props.googleUrl,
        isPreview,
        minStars,
        categoryKey,
        rating: state.rating,
        selectedTags: state.selectedTags,
        addedCustomTags: state.addedCustomTags,
        selectedStaff: state.selectedStaff,
        reviewText: state.reviewText,
        feedback: state.feedback,
        customerEmail: state.customerEmail,
        customerPhone: state.customerPhone,
        activeRequestId,
        requestId,
        ensureActiveRequestId,
        trackRequestUpdate,
        setStep: state.setStep,
        setRating: state.setRating,
        setReviewText: state.setReviewText,
        setIsSubmitting: state.setIsSubmitting,
        setIsRedirecting: state.setIsRedirecting,
        setProgress: state.setProgress,
        setCustomerPhone: state.setCustomerPhone,
        privateFeedbackEmailMode,
        privateFeedbackPhoneMode,
    });

    const canSubmitNegative =
        state.feedback.trim().length > 0 &&
        negativeContactValid(
            state.customerEmail,
            state.customerPhone,
            privateFeedbackEmailMode,
            privateFeedbackPhoneMode
        );

    const shellProps = useMemo(
        () => buildReviewFlowShellProps(props, state.mounted, useCustomPageBackdrop, pageBgHex),
        [pageBgHex, props, state.mounted, useCustomPageBackdrop]
    );

    const resetToRatingFromTags = () => {
        state.setRating(null);
        state.setSelectedTags([]);
        state.setAddedCustomTags([]);
        state.setCustomTagInput("");
        state.setShowCustomInput(false);
        state.setStep("rating");
    };

    return {
        props,
        resolvedBrandColor,
        categoryKey,
        tags,
        initials,
        hasTagSelection,
        canSubmitNegative,
        shellProps,
        tagHandlers,
        actions,
        resetToRatingFromTags,
        ...state,
    };
}
