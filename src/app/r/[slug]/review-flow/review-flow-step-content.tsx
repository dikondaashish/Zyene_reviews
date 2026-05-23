"use client";

import { ReviewFlowShell } from "./review-flow-shell";
import { AiReviewStep } from "./steps/ai-review-step";
import { GeneratingStep } from "./steps/generating-step";
import { NegativeStep } from "./steps/negative-step";
import { RatingStep } from "./steps/rating-step";
import { TagsStep } from "./steps/tags-step";
import { ThankYouStep } from "./steps/thank-you-step";
import type { useReviewFlow } from "./use-review-flow";

type ReviewFlowState = ReturnType<typeof useReviewFlow>;

export function ReviewFlowStepContent({ flow }: { flow: ReviewFlowState }) {
    const { props, step, shellProps, actions, tagHandlers, resetToRatingFromTags } = flow;

    if (step === "thankyou") {
        return (
            <ReviewFlowShell {...shellProps}>
                <ThankYouStep thankYouHeading={props.thankYouHeading} thankYouMessage={props.thankYouMessage} />
            </ReviewFlowShell>
        );
    }

    if (step === "negative") {
        return (
            <ReviewFlowShell {...shellProps}>
                <NegativeStep
                    rating={flow.rating}
                    resolvedBrandColor={flow.resolvedBrandColor}
                    apologyMsg={props.apologyMsg}
                    negativeSubheading={props.negativeSubheading}
                    privateFeedbackOfferMode={props.privateFeedbackOfferMode}
                    privateFeedbackOfferMessage={props.privateFeedbackOfferMessage}
                    negativeTextareaPlaceholder={props.negativeTextareaPlaceholder}
                    privateFeedbackEmailMode={props.privateFeedbackEmailMode}
                    privateFeedbackPhoneMode={props.privateFeedbackPhoneMode}
                    feedback={flow.feedback}
                    customerEmail={flow.customerEmail}
                    customerPhone={flow.customerPhone}
                    isSubmitting={flow.isSubmitting}
                    canSubmitNegative={flow.canSubmitNegative}
                    negativeButtonText={props.negativeButtonText}
                    googleUrl={props.googleUrl}
                    onFeedbackChange={flow.setFeedback}
                    onCustomerEmailChange={flow.setCustomerEmail}
                    onCustomerPhoneChange={flow.setCustomerPhone}
                    onSubmit={actions.handleNegativeFormSubmit}
                    onBack={actions.resetToRatingFromNegative}
                />
            </ReviewFlowShell>
        );
    }

    if (step === "rating") {
        return (
            <ReviewFlowShell {...shellProps}>
                <RatingStep
                    businessName={props.businessName}
                    logoUrl={props.logoUrl}
                    initials={flow.initials}
                    resolvedBrandColor={flow.resolvedBrandColor}
                    ratingSubtitle={props.ratingSubtitle}
                    welcomeMsg={props.welcomeMsg}
                    ratingStyle={props.ratingStyle ?? "emoji"}
                    rating={flow.rating}
                    hoverRating={flow.hoverRating}
                    onRate={actions.handleRate}
                    onHoverRating={flow.setHoverRating}
                />
            </ReviewFlowShell>
        );
    }

    if (step === "tags") {
        return (
            <ReviewFlowShell
                {...shellProps}
                contentClassName="overflow-visible relative z-20"
                footerClassName="pt-3 pb-3"
            >
                <TagsStep
                    resolvedBrandColor={flow.resolvedBrandColor}
                    tagsHeading={props.tagsHeading}
                    tagsSubheading={props.tagsSubheading}
                    tags={flow.tags}
                    categoryKey={flow.categoryKey}
                    selectedTags={flow.selectedTags}
                    showCustomInput={flow.showCustomInput}
                    customTagInput={flow.customTagInput}
                    addedCustomTags={flow.addedCustomTags}
                    hasTagSelection={flow.hasTagSelection}
                    enableStaffSelection={props.enableStaffSelection ?? false}
                    staffNames={props.staffNames ?? []}
                    selectedStaff={flow.selectedStaff}
                    onToggleTag={tagHandlers.toggleTag}
                    onToggleEverything={tagHandlers.handleToggleEverything}
                    onOpenCustomInputPanel={tagHandlers.openCustomInputPanel}
                    onToggleCustomInput={() => flow.setShowCustomInput(false)}
                    onCustomTagInputChange={flow.setCustomTagInput}
                    onAddCustomTag={tagHandlers.addCustomTag}
                    onRemoveCustomTag={tagHandlers.removeCustomTag}
                    onToggleStaff={tagHandlers.toggleStaff}
                    onContinue={actions.handleTagsContinue}
                    onBack={resetToRatingFromTags}
                />
            </ReviewFlowShell>
        );
    }

    if (step === "generating") {
        return (
            <ReviewFlowShell {...shellProps}>
                <GeneratingStep />
            </ReviewFlowShell>
        );
    }

    if (step === "review") {
        return (
            <ReviewFlowShell {...shellProps}>
                <AiReviewStep
                    googleHeading={props.googleHeading}
                    googleSubheading={props.googleSubheading}
                    reviewText={flow.reviewText}
                    isRedirecting={flow.isRedirecting}
                    isSubmitting={flow.isSubmitting}
                    progress={flow.progress}
                    resolvedBrandColor={flow.resolvedBrandColor}
                    googleButtonText={props.googleButtonText}
                    onReviewTextChange={flow.setReviewText}
                    onPostToGoogle={actions.handlePostToGoogle}
                    onBack={() => flow.setStep("tags")}
                />
            </ReviewFlowShell>
        );
    }

    return null;
}
