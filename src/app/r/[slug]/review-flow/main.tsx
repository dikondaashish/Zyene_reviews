"use client";

import { useState, useEffect, FormEvent, useRef, useCallback } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ensureCompleteReviewText } from "@/lib/review-flow/ensure-complete-review";
import { resolveReviewFlowTags } from "@/lib/review-flow/tag-display";
import {
    buildTagsSelected,
    EVERYTHING_TAG,
    MAX_CUSTOM_TAG_CHIPS,
    normalizeCustomTagInput,
} from "@/lib/review-flow/tags-for-ai";
import { parseReviewRefFromSearch } from "./helpers";
import { ReviewFlowShell } from "./review-flow-shell";
import { AiReviewStep } from "./steps/ai-review-step";
import { GeneratingStep } from "./steps/generating-step";
import { NegativeStep } from "./steps/negative-step";
import { RatingStep } from "./steps/rating-step";
import { TagsStep } from "./steps/tags-step";
import { ThankYouStep } from "./steps/thank-you-step";
import { FlowStep, PublicReviewFlowProps } from "./types";

export function PublicReviewFlow({
    businessId,
    businessName,
    businessCategory,
    requestId,
    googleUrl,
    brandColor,
    reviewPageBackgroundColor,
    logoUrl,
    minStars: minStarsVal,
    ratingStyle = "emoji",
    welcomeMsg,
    apologyMsg,
    ratingSubtitle,
    tagsHeading,
    tagsSubheading,
    customTags,
    googleHeading,
    googleSubheading,
    googleButtonText,
    enableStaffSelection = false,
    staffNames = [],
    negativeSubheading,
    negativeTextareaPlaceholder,
    negativeButtonText,
    privateFeedbackEmailMode = "optional",
    privateFeedbackPhoneMode = "hidden",
    privateFeedbackOfferMode = "hidden",
    privateFeedbackOfferMessage = null,
    thankYouHeading,
    thankYouMessage,
    footerLink,
    footerCompanyName,
    footerLogoUrl,
    hideBranding = false,
    isPreview = false,
    previewStep,
    className,
}: PublicReviewFlowProps) {
    const resolvedBrandColor =
        typeof brandColor === "string" && brandColor.trim().length > 0 ? brandColor.trim() : "var(--primary)";
    const minStars = minStarsVal ?? 4;
    const pageBgHex = reviewPageBackgroundColor?.trim() ?? "";
    const useCustomPageBackdrop =
        pageBgHex.length > 0 && /^#([0-9A-F]{3}){1,2}$/i.test(pageBgHex);
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

    const [activeRequestId, setActiveRequestId] = useState<string | undefined>(requestId);
    const trackOpenInFlightRef = useRef<Promise<string | undefined> | null>(null);

    const resolveTrackingRequestId = useCallback((): string | undefined => {
        const fromProp = requestId?.trim();
        if (fromProp && z.string().uuid().safeParse(fromProp).success) {
            return fromProp;
        }
        const fromUrl = parseReviewRefFromSearch();
        if (fromUrl && !fromProp) {
            console.info("[PublicReviewFlow] using ?ref= from window.location (prop missing)");
        }
        return fromUrl;
    }, [requestId]);

    const ensureActiveRequestId = useCallback(async (): Promise<string | undefined> => {
        if (isPreview) return undefined;
        if (activeRequestId) return activeRequestId;

        if (trackOpenInFlightRef.current) {
            return trackOpenInFlightRef.current;
        }

        trackOpenInFlightRef.current = (async () => {
            try {
                const rid = resolveTrackingRequestId();
                const res = await fetch("/api/track/review-open", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        businessId,
                        requestId: rid,
                    }),
                });

                const data = (await res.json().catch(() => ({}))) as { requestId?: string; error?: string };
                if (!res.ok) {
                }
                if (res.ok && typeof data.requestId === "string" && data.requestId.length > 0) {
                    setActiveRequestId(data.requestId);
                    return data.requestId as string;
                }
            } catch (error) {
            } finally {
                trackOpenInFlightRef.current = null;
            }

            return undefined;
        })();

        return trackOpenInFlightRef.current;
    }, [activeRequestId, businessId, isPreview, requestId, resolveTrackingRequestId]);

    useEffect(() => {
        if (isPreview) return;
        void ensureActiveRequestId();
    }, [ensureActiveRequestId, isPreview]);

    const trackRequestUpdate = async (trackData: Record<string, unknown>) => {
        if (isPreview) return;
        const requestIdToUse = activeRequestId ?? (await ensureActiveRequestId());
        if (!requestIdToUse) return;
        try {
            await fetch("/api/track/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "update", requestId: requestIdToUse, trackData }),
            });
        } catch (error) {
        }
    };

    const categoryKey = businessCategory.toLowerCase();
    const tags = resolveReviewFlowTags(customTags, categoryKey);

    const initials = businessName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const handleRate = (stars: number) => {
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
    };

    const hasTagSelection = selectedTags.length > 0 || addedCustomTags.length > 0;

    const handleToggleEverything = () => {
        setAddedCustomTags([]);
        setCustomTagInput("");
        setShowCustomInput(false);
        setSelectedTags((prev) => (prev.includes(EVERYTHING_TAG) ? [] : [EVERYTHING_TAG]));
    };

    const openCustomInputPanel = () => {
        setSelectedTags((prev) => prev.filter((t) => t !== EVERYTHING_TAG));
        setShowCustomInput(true);
    };

    const addCustomTag = () => {
        const normalized = normalizeCustomTagInput(customTagInput);
        if (!normalized) return;
        setAddedCustomTags((prev) => {
            if (prev.length >= MAX_CUSTOM_TAG_CHIPS) return prev;
            if (prev.some((t) => t.toLowerCase() === normalized.toLowerCase())) return prev;
            return [...prev, normalized];
        });
        setCustomTagInput("");
    };

    const removeCustomTag = (index: number) => {
        setAddedCustomTags((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleTag = (tag: string) => {
        if (tag === EVERYTHING_TAG) {
            handleToggleEverything();
            return;
        }
        setSelectedTags((prev) => {
            const withoutEverything = prev.filter((t) => t !== EVERYTHING_TAG);
            return withoutEverything.includes(tag)
                ? withoutEverything.filter((t) => t !== tag)
                : [...withoutEverything, tag];
        });
    };

    const toggleStaff = (name: string) => {
        setSelectedStaff((prev) => {
            const next = prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name];
            void trackRequestUpdate({ selected_staff: next });
            return next;
        });
    };

    const handleGenerateReview = async () => {
        setStep("generating");

        if (isPreview) {
            setTimeout(() => {
                setReviewText(`[PREVIEW] Great experience at ${businessName}! Really loved the ${selectedTags[0] || "service"}.`);
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
    };

    const handleTagsContinue = () => {
        void handleGenerateReview();
    };

    const handlePostToGoogle = async () => {
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
    };

    const emailLooksValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    const phoneLooksValid = (v: string) => {
        const t = v.trim();
        if (!t) return false;
        return /^[\d+][\d\s().-]{6,31}$/.test(t) && t.replace(/\D/g, "").length >= 7;
    };

    const negativeContactValid = () => {
        const em = privateFeedbackEmailMode;
        const ph = privateFeedbackPhoneMode;
        if (em === "required" && !emailLooksValid(customerEmail)) return false;
        if (em === "optional" && customerEmail.trim() && !emailLooksValid(customerEmail)) return false;
        if (ph === "required" && !phoneLooksValid(customerPhone)) return false;
        if (ph === "optional" && customerPhone.trim() && !phoneLooksValid(customerPhone)) return false;
        return true;
    };

    const handleSubmitFeedback = async () => {
        if (!rating) return;

        if (isPreview) {
            toast.info("Preview Mode: Feedback submitted.");
            setStep("thankyou");
            return;
        }

        if (!negativeContactValid()) {
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
    };

    const handleNegativeFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void handleSubmitFeedback();
    };

    const shellProps = {
        mounted,
        className,
        useCustomPageBackdrop,
        pageBgHex,
        hideBranding,
        footerLink,
        footerLogoUrl,
        footerCompanyName,
    };

    if (step === "thankyou") {
        return (
            <ReviewFlowShell {...shellProps}>
                <ThankYouStep thankYouHeading={thankYouHeading} thankYouMessage={thankYouMessage} />
            </ReviewFlowShell>
        );
    }

    if (step === "negative") {
        const canSubmitNegative = feedback.trim().length > 0 && negativeContactValid();
        return (
            <ReviewFlowShell {...shellProps}>
                <NegativeStep
                    rating={rating}
                    resolvedBrandColor={resolvedBrandColor}
                    apologyMsg={apologyMsg}
                    negativeSubheading={negativeSubheading}
                    privateFeedbackOfferMode={privateFeedbackOfferMode}
                    privateFeedbackOfferMessage={privateFeedbackOfferMessage}
                    negativeTextareaPlaceholder={negativeTextareaPlaceholder}
                    privateFeedbackEmailMode={privateFeedbackEmailMode}
                    privateFeedbackPhoneMode={privateFeedbackPhoneMode}
                    feedback={feedback}
                    customerEmail={customerEmail}
                    customerPhone={customerPhone}
                    isSubmitting={isSubmitting}
                    canSubmitNegative={canSubmitNegative}
                    negativeButtonText={negativeButtonText}
                    googleUrl={googleUrl}
                    onFeedbackChange={setFeedback}
                    onCustomerEmailChange={setCustomerEmail}
                    onCustomerPhoneChange={setCustomerPhone}
                    onSubmit={handleNegativeFormSubmit}
                    onBack={() => {
                        setRating(null);
                        setCustomerPhone("");
                        setStep("rating");
                    }}
                />
            </ReviewFlowShell>
        );
    }

    if (step === "rating") {
        return (
            <ReviewFlowShell {...shellProps}>
                <RatingStep
                    businessName={businessName}
                    logoUrl={logoUrl}
                    initials={initials}
                    resolvedBrandColor={resolvedBrandColor}
                    ratingSubtitle={ratingSubtitle}
                    welcomeMsg={welcomeMsg}
                    ratingStyle={ratingStyle}
                    rating={rating}
                    hoverRating={hoverRating}
                    onRate={handleRate}
                    onHoverRating={setHoverRating}
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
                    resolvedBrandColor={resolvedBrandColor}
                    tagsHeading={tagsHeading}
                    tagsSubheading={tagsSubheading}
                    tags={tags}
                    categoryKey={categoryKey}
                    selectedTags={selectedTags}
                    showCustomInput={showCustomInput}
                    customTagInput={customTagInput}
                    addedCustomTags={addedCustomTags}
                    hasTagSelection={hasTagSelection}
                    enableStaffSelection={enableStaffSelection}
                    staffNames={staffNames}
                    selectedStaff={selectedStaff}
                    onToggleTag={toggleTag}
                    onToggleEverything={handleToggleEverything}
                    onOpenCustomInputPanel={openCustomInputPanel}
                    onToggleCustomInput={() => setShowCustomInput(false)}
                    onCustomTagInputChange={setCustomTagInput}
                    onAddCustomTag={addCustomTag}
                    onRemoveCustomTag={removeCustomTag}
                    onToggleStaff={toggleStaff}
                    onContinue={handleTagsContinue}
                    onBack={() => {
                        setRating(null);
                        setSelectedTags([]);
                        setAddedCustomTags([]);
                        setCustomTagInput("");
                        setShowCustomInput(false);
                        setStep("rating");
                    }}
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
                    googleHeading={googleHeading}
                    googleSubheading={googleSubheading}
                    reviewText={reviewText}
                    isRedirecting={isRedirecting}
                    isSubmitting={isSubmitting}
                    progress={progress}
                    resolvedBrandColor={resolvedBrandColor}
                    googleButtonText={googleButtonText}
                    onReviewTextChange={setReviewText}
                    onPostToGoogle={handlePostToGoogle}
                    onBack={() => setStep("tags")}
                />
            </ReviewFlowShell>
        );
    }

    return null;
}
