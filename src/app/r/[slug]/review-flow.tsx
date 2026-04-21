"use client";

import { useState, useEffect, FormEvent } from "react";
import { Loader2, Copy, ExternalLink, Sparkles, Send, ArrowLeft, Mail, Phone, Gift, ChevronRight, Check, Star } from "lucide-react";
import { createClient } from "@/lib/db/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    DEFAULT_REVIEW_PAGE_BACKDROP_CSS,
    DEFAULT_REVIEW_PAGE_BACKGROUND_HEX,
    reviewPageBackdropGradient,
    reviewPageOrbRgba,
} from "@/lib/utils/review-page-background";

// ─── Category → Tag mapping ────────────────────────────────────────────
const CATEGORY_TAGS: Record<string, string[]> = {
    restaurant: ["🍽️ Food", "👨‍🍳 Service", "✨ Ambiance", "💰 Prices", "🍕 Portions", "⚡ Speed", "🧹 Cleanliness", "📋 Menu Variety"],
    cafe: ["☕ Coffee", "🍰 Food", "✨ Ambiance", "👨‍🍳 Service", "💰 Prices", "📶 Wi-Fi", "💺 Seating"],
    bar: ["🍸 Drinks", "🎵 Atmosphere", "👨‍🍳 Service", "🎶 Music", "💰 Prices", "🍕 Food", "👥 Crowd"],
    salon: ["💇 Service", "✨ Skill", "🧹 Cleanliness", "💆 Ambiance", "💰 Prices", "🧴 Products", "😌 Relaxation"],
    spa: ["💆 Service", "😌 Relaxation", "🧹 Cleanliness", "✨ Ambiance", "🧖 Treatments", "👨‍⚕️ Staff", "💰 Value"],
    gym: ["🏋️ Equipment", "👨‍🏫 Trainers", "🧹 Cleanliness", "💰 Prices", "🎯 Classes", "💪 Atmosphere", "⏰ Hours"],
    fitness: ["👨‍🏫 Trainers", "🏋️ Equipment", "🎯 Classes", "💪 Atmosphere", "🧹 Cleanliness", "📈 Results", "👥 Community"],
    medical: ["👨‍⚕️ Staff", "🏥 Professionalism", "⏰ Wait Time", "🧹 Cleanliness", "💬 Communication", "❤️ Care"],
    dental: ["👨‍⚕️ Staff", "🏥 Professionalism", "😌 Comfort", "🧹 Cleanliness", "💬 Communication", "✨ Pain-Free"],
    retail: ["🛍️ Selection", "💰 Prices", "👨‍💼 Staff", "⭐ Quality", "🏪 Store Layout", "↩️ Returns"],
    auto: ["🤝 Honesty", "⚡ Speed", "💰 Prices", "⭐ Quality", "💬 Communication", "🏥 Professionalism"],
    hotel: ["🛏️ Room", "🧹 Cleanliness", "👨‍💼 Staff", "📍 Location", "🏊 Amenities", "💰 Value"],
    service: ["⭐ Quality", "🏥 Professionalism", "💬 Communication", "⏰ Timeliness", "💰 Value", "🧠 Expertise"],
    smoke: ["🌿 Products", "👨‍💼 Service", "⭐ Quality", "💰 Prices", "🏪 Selection", "✨ Atmosphere"],
    other: ["⭐ Quality", "👨‍💼 Service", "💰 Value", "✨ Atmosphere", "👥 Staff", "🎯 Experience"],
};

// ─── Emoji ratings ─────────────────────────────────────────────────────
const RATINGS = [
    { emoji: "😍", label: "Excellent", value: 5, color: "from-chart-2 to-chart-2" },
    { emoji: "😊", label: "Good", value: 4, color: "from-chart-2 to-chart-2" },
    { emoji: "😐", label: "OK", value: 3, color: "from-chart-4 to-chart-4" },
    { emoji: "😕", label: "Bad", value: 2, color: "from-primary/70 to-primary" },
    { emoji: "😞", label: "Awful", value: 1, color: "from-destructive to-destructive" },
];

export type PrivateFeedbackContactMode = "hidden" | "optional" | "required";
export type PrivateFeedbackOfferMode = "hidden" | "visible";

const DEFAULT_PRIVATE_FEEDBACK_OFFER_TEXT =
    "We're sorry for the inconvenience. We'd like to make things right with a special offer for you — we'll follow up with the details.";

// ─── Props ──────────────────────────────────────────────────────────────
export interface PublicReviewFlowProps {
    businessId: string;
    businessName: string;
    businessCategory: string;
    requestId?: string;
    googleUrl?: string;
    brandColor?: string;
    /** Outer full-page gradient behind the white card (Brand Identity → page background) */
    reviewPageBackgroundColor?: string | null;
    logoUrl?: string;
    minStars?: number;
    ratingStyle?: string;
    welcomeMsg?: string; // Main Rating Heading
    apologyMsg?: string; // Main Negative Heading
    ratingSubtitle?: string;
    tagsHeading?: string;
    tagsSubheading?: string;
    customTags?: string[];
    googleHeading?: string;
    googleSubheading?: string;
    googleButtonText?: string;
    enableStaffSelection?: boolean;
    staffNames?: string[];
    negativeSubheading?: string; // "Share your feedback directly..."
    negativeTextareaPlaceholder?: string;
    negativeButtonText?: string;
    /** Public negative-feedback step: whether email is collected and if it is optional or required */
    privateFeedbackEmailMode?: PrivateFeedbackContactMode;
    privateFeedbackPhoneMode?: PrivateFeedbackContactMode;
    /** When visible, shows a goodwill / special-offer message above the feedback field */
    privateFeedbackOfferMode?: PrivateFeedbackOfferMode;
    privateFeedbackOfferMessage?: string | null;
    thankYouHeading?: string;
    thankYouMessage?: string;
    footerText?: string;
    footerCompanyName?: string;
    footerLink?: string;
    footerLogoUrl?: string;
    hideBranding?: boolean;
    isPreview?: boolean;
    previewStep?: FlowStep;
    className?: string;
}

// ─── Step type ──────────────────────────────────────────────────────────
type FlowStep = "rating" | "tags" | "generating" | "review" | "thankyou" | "negative";

// ─── Main component ─────────────────────────────────────────────────────
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
    footerText,
    footerCompanyName,
    footerLink,
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
    
    // Sync internal step with previewStep when in preview mode
    useEffect(() => {
        if (isPreview && previewStep) {
            setStep(previewStep);
        }
    }, [isPreview, previewStep]);

    const supabase = createClient();

    const trackRequestUpdate = async (trackData: Record<string, unknown>) => {
        if (isPreview || !requestId) return;
        try {
            await fetch("/api/track/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "update", requestId, trackData }),
            });
        } catch (error) {
            console.error("Tracking update failed:", error);
        }
    };

    // Resolve tags: Use custom tags if provided, otherwise category defaults
    const categoryKey = businessCategory.toLowerCase();
    const defaultTags = CATEGORY_TAGS[categoryKey] || CATEGORY_TAGS.other;
    const tags = (customTags && customTags.length > 0) ? customTags : defaultTags;

    // Get initials for avatar
    const initials = businessName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    // ─── Handlers ───────────────────────────────────────────────────────

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
        }, 400); // Delay to show satisfying emoji scale-up animation
    };

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
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
            const res = await fetch("/api/review-flow/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reviewRequestId: requestId,
                    businessId,
                    businessName,
                    businessCategory: categoryKey,
                    rating,
                    selectedTags: selectedTags.map((t) => t.replace(/^[^\s]+\s/, "")), // Strip emojis for AI
                    selectedStaff,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate");

            setReviewText(data.reviewText);
            setStep("review");
        } catch (error) {
            console.error("Generation error:", error);
            const firstTag = selectedTags[0]?.replace(/^[^\s]+\s/, "") || "experience";
            setReviewText(
                `Great experience at ${businessName}! Really loved the ${firstTag.toLowerCase()}. Would definitely come back.`
            );
            setStep("review");
        }
    };

    const handleTagsContinue = () => {
        // Staff is chosen on the same screen as tags (no separate step).
        void handleGenerateReview();
    };

    const handlePostToGoogle = async () => {
        if (isPreview) {
            toast.info("Preview Mode: This would open Google Maps.");
            setStep("thankyou");
            return;
        }

        // 1. Copy to clipboard
        try {
            await navigator.clipboard.writeText(reviewText);
            toast.success("Review copied!", { duration: 2000 });
        } catch {
            toast.info("Tap and hold the review text to copy it.");
        }

        // 2. Start Animation
        setIsRedirecting(true);
        // Small delay to ensure render before starting width transition
        setTimeout(() => setProgress(100), 50);

        // Track completion
        try {
            const trackData = {
                status: "completed",
                rating_given: rating,
                tags_selected: selectedTags,
                ai_review_text: reviewText,
                completed_at: new Date().toISOString(),
                selected_staff: selectedStaff,
            };

            await trackRequestUpdate(trackData);
        } catch (err) {
            console.error("Tracking error:", err);
        }

        // 3. Wait for animation then redirect
        setTimeout(() => {
            if (googleUrl) {
                window.location.href = googleUrl;
            } else {
                setStep("thankyou");
            }
        }, 2050); // Slightly longer than transition
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
                    review_request_id: requestId,
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
            console.error("Feedback error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to submit feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNegativeFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void handleSubmitFeedback();
    };

    // ─── Shared card wrapper ────────────────────────────────────────────

    const renderCardWrapper = (children: React.ReactNode, contentClassName?: string) => (
        <div
            className={cn(
                "min-h-screen flex items-center justify-center p-4 transition-all duration-500",
                !mounted && "opacity-0",
                mounted && "opacity-100",
                className // Apply parent PublicReviewFlow className (outer container)
            )}
            style={{
                background: useCustomPageBackdrop
                    ? reviewPageBackdropGradient(pageBgHex)
                    : DEFAULT_REVIEW_PAGE_BACKDROP_CSS,
            }}
        >
            {/* Subtle animated gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <>
                    <div
                        className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse"
                        style={{
                            backgroundColor: reviewPageOrbRgba(
                                useCustomPageBackdrop ? pageBgHex : DEFAULT_REVIEW_PAGE_BACKGROUND_HEX,
                                0.14
                            ),
                        }}
                    />
                    <div
                        className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse"
                        style={{
                            backgroundColor: reviewPageOrbRgba(
                                useCustomPageBackdrop ? pageBgHex : DEFAULT_REVIEW_PAGE_BACKGROUND_HEX,
                                0.11
                            ),
                            animationDelay: "1s",
                        }}
                    />
                </>
            </div>

            <div className={cn(
                "relative w-full max-w-md bg-card rounded-3xl border border-border overflow-hidden",
                "transform transition-all duration-500",
                mounted ? "translate-y-0 scale-100" : "translate-y-4 scale-95",
                contentClassName
            )}>
                {children}

                {/* Powered by footer */}
                {!hideBranding && (
                    <div className="py-4 text-center border-t border-border">
                        <div className="text-xs text-muted-foreground font-medium tracking-wide flex items-center justify-center gap-1.5">
                            <span>Powered by</span>
                            {footerLink ? (
                                <a
                                    href={footerLink.startsWith("http") ? footerLink : `https://${footerLink}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 no-underline"
                                >
                                    {footerLogoUrl && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={footerLogoUrl}
                                            alt="Footer Logo"
                                            className="h-4 w-4 object-contain"
                                        />
                                    )}
                                    <span className="text-foreground font-bold tracking-tight hover:text-foreground/80 transition-colors">
                                        {footerCompanyName || "Zyene"}
                                    </span>
                                </a>
                            ) : (
                                <span className="inline-flex items-center gap-1.5">
                                    {footerLogoUrl && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={footerLogoUrl}
                                            alt="Footer Logo"
                                            className="h-4 w-4 object-contain"
                                        />
                                    )}
                                    <span className="text-foreground font-bold tracking-tight">
                                        {footerCompanyName || "Zyene"}
                                    </span>
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // ─── Render: Thank You (final) ──────────────────────────────────────

    if (step === "thankyou") {
        return renderCardWrapper(
            <div className="px-8 py-16 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="relative inline-flex">
                    <div className="h-28 w-28 bg-gradient-to-br from-chart-2 to-chart-2 rounded-full flex items-center justify-center shadow-lg shadow-chart-2/30">
                        <span className="text-6xl animate-bounce" style={{ animationDuration: "2s" }}>🎉</span>
                    </div>
                    <div className="absolute -top-1 -right-1 h-8 w-8 bg-chart-4 rounded-full flex items-center justify-center text-lg shadow-md">
                        ✨
                    </div>
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">{thankYouHeading || "Thank You!"}</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
                        {thankYouMessage || "Your feedback means the world to us.\nWe appreciate you taking the time."}
                    </p>
                </div>
            </div>
        );
    }

    // ─── Render: Negative feedback (1-3 stars) ──────────────────────────

    if (step === "negative") {
        const selectedRating = RATINGS.find((r) => r.value === rating);
        const canSubmitNegative =
            feedback.trim().length > 0 && negativeContactValid();
        const offerBannerText =
            privateFeedbackOfferMessage?.trim() || DEFAULT_PRIVATE_FEEDBACK_OFFER_TEXT;
        const offerBrandHex =
            resolvedBrandColor !== "var(--primary)" && /^#([0-9A-F]{3}){1,2}$/i.test(resolvedBrandColor)
                ? resolvedBrandColor
                : null;
        return renderCardWrapper(
            <form
                className="px-8 py-10 space-y-6 animate-in fade-in slide-in-from-right-4 duration-400"
                onSubmit={handleNegativeFormSubmit}
            >
                {/* Header with emoji */}
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center flex-shrink-0 border border-border">
                        <span className="text-4xl">{selectedRating?.emoji || "😕"}</span>
                    </div>
                    <div className="text-left">
                        <h2 className="text-xl font-bold text-foreground">
                            {apologyMsg || "Sorry about that"}
                        </h2>
                        <p className="text-muted-foreground text-sm leading-snug">
                            {negativeSubheading || "Share your feedback directly with the owner."}
                        </p>
                    </div>
                </div>

                {privateFeedbackOfferMode === "visible" && (
                    <div
                        className={cn(
                            "relative overflow-hidden rounded-2xl border border-border p-5 pl-5",
                            "bg-gradient-to-br from-background via-muted/80 to-primary/5",
                            "ring-1 ring-border animate-in fade-in zoom-in-95 duration-500"
                        )}
                        role="status"
                        aria-live="polite"
                    >
                        <div
                            className="pointer-events-none absolute inset-y-4 left-3 w-1 rounded-full"
                            style={{
                                background: offerBrandHex
                                    ? `linear-gradient(180deg, ${offerBrandHex} 0%, var(--public-review-gradient-b) 70%, var(--public-review-gradient-c) 100%)`
                                    : "var(--public-review-offer-strip-default)",
                            }}
                            aria-hidden
                        />
                        <div
                            className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-gradient-to-br from-primary/20 to-chart-2/20 blur-[2px]"
                            aria-hidden
                        />
                        <div
                            className="pointer-events-none absolute -bottom-6 right-10 h-24 w-24 rounded-full bg-muted/40"
                            aria-hidden
                        />
                        <div
                            className="pointer-events-none absolute right-20 top-3 text-primary/35"
                            aria-hidden
                        >
                            <Sparkles className="h-4 w-4" strokeWidth={2} />
                        </div>
                        <div className="relative flex gap-4 pl-3">
                            <div
                                className={cn(
                                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-primary-foreground",
                                    "bg-gradient-to-br from-primary to-chart-2 shadow-md shadow-foreground/10 ring-2 ring-primary-foreground/80"
                                )}
                                aria-hidden
                            >
                                <Gift className="h-6 w-6" strokeWidth={2.25} />
                            </div>
                            <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground">
                                        Special offer
                                    </p>
                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary ring-1 ring-primary/25">
                                        Exclusive
                                    </span>
                                </div>
                                <p className="text-[15px] leading-relaxed text-muted-foreground whitespace-pre-line">
                                    {offerBannerText}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Feedback textarea */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Your feedback</label>
                    <textarea
                        placeholder={negativeTextareaPlaceholder || "Tell us what happened..."}
                        className="w-full min-h-[140px] text-base p-4 rounded-2xl border-2 border-border focus:border-primary focus:ring-0 outline-none resize-none transition-colors bg-muted placeholder:text-muted-foreground"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        autoFocus
                    />
                </div>

                {privateFeedbackEmailMode !== "hidden" && (
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">
                            Your email{" "}
                            {privateFeedbackEmailMode === "required" ? (
                                <span className="text-destructive">*</span>
                            ) : (
                                <span className="text-muted-foreground font-normal">(optional)</span>
                            )}
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="w-full h-12 pl-11 pr-4 rounded-2xl border-2 border-border focus:border-primary focus:ring-0 outline-none transition-colors bg-muted text-sm placeholder:text-muted-foreground"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}

                {privateFeedbackPhoneMode !== "hidden" && (
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">
                            Phone number{" "}
                            {privateFeedbackPhoneMode === "required" ? (
                                <span className="text-destructive">*</span>
                            ) : (
                                <span className="text-muted-foreground font-normal">(optional)</span>
                            )}
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                placeholder="+1 (555) 000-0000"
                                className="w-full h-12 pl-11 pr-4 rounded-2xl border-2 border-border focus:border-primary focus:ring-0 outline-none transition-colors bg-muted text-sm placeholder:text-muted-foreground"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                <div className="space-y-3 pt-2">
                    <button
                        type="submit"
                        className={cn(
                            "w-full h-14 rounded-2xl text-base font-semibold text-primary-foreground transition-all duration-300",
                            "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary",
                            "shadow-lg shadow-primary/20 hover:shadow-primary/30",
                            "active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
                            "flex items-center justify-center gap-2"
                        )}
                        disabled={isSubmitting || !canSubmitNegative}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        {isSubmitting ? "Sending..." : (negativeButtonText || "Send Feedback")}
                    </button>

                    <div className="flex items-center justify-between px-1">
                        <button
                            type="button"
                            className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors"
                            onClick={() => {
                                setRating(null);
                                setCustomerPhone("");
                                setStep("rating");
                            }}
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back
                        </button>
                        {googleUrl && (
                            <a
                                href={googleUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                            >
                                Go to Google
                            </a>
                        )}
                    </div>
                </div>
            </form>
        );
    }

    // ─── Render: Star Rating (step 1) ───────────────────────────────────

    if (step === "rating") {
        return renderCardWrapper(
            <div className="px-8 py-10 space-y-8">
                    {/* Business avatar */}
                    <div className="flex flex-col items-center gap-4">
                        {logoUrl ? (
                            <div className="h-24 w-24 rounded-full border-4 border-background overflow-hidden bg-background">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={logoUrl} alt={businessName} className="h-full w-full object-cover" />
                            </div>
                        ) : (
                            <div
                                className="h-20 w-20 rounded-2xl flex items-center justify-center shadow-lg text-primary-foreground"
                                style={{ backgroundColor: resolvedBrandColor }}
                            >
                                <span className="text-2xl font-bold">{initials}</span>
                            </div>
                        )}
                        <div className="text-center">
                            <h1 className="text-xl font-bold text-foreground mb-1">{businessName}</h1>
                            <p className="text-muted-foreground text-sm">{ratingSubtitle || "Your feedback means a lot to us!"}</p>
                        </div>
                    </div>

                    {/* Question */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-foreground leading-tight px-4 whitespace-pre-line">
                            {welcomeMsg || "How was your experience?"}
                        </h2>
                    </div>

                    {/* Rating UI */}
                    {ratingStyle === "emoji" && (
                        <div className="grid grid-cols-5 gap-2">
                            {RATINGS.map((r) => (
                                <button
                                    key={r.value}
                                    onClick={() => handleRate(r.value)}
                                    onMouseEnter={() => setHoverRating(r.value)}
                                    onMouseLeave={() => setHoverRating(null)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300",
                                        "border-2 hover:border-primary/40 hover:bg-primary/10",
                                        "focus:outline-none focus:ring-2 focus:ring-primary/40",
                                        rating !== r.value && "active:scale-95",
                                        hoverRating === r.value && rating !== r.value
                                            ? "border-primary/50 bg-primary/10 scale-105 shadow-md"
                                            : rating === r.value
                                                ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-md scale-105 z-10"
                                                : "border-border bg-background"
                                    )}
                                >
                                    <span className={cn(
                                        "text-3xl sm:text-4xl transition-all duration-500",
                                        hoverRating === r.value && rating !== r.value && "scale-110 ease-out",
                                        rating === r.value 
                                            ? "scale-[1.6] sm:scale-[1.8] -translate-y-2 drop-shadow-2xl ease-[cubic-bezier(0.34,1.56,0.64,1)] z-20 relative"
                                            : "ease-out"
                                    )}>
                                        {r.emoji}
                                    </span>
                                    <span className={cn(
                                        "text-[10px] sm:text-xs font-semibold tracking-tight transition-all duration-300",
                                        hoverRating === r.value || rating === r.value
                                            ? "text-primary"
                                            : "text-muted-foreground",
                                        rating === r.value && "opacity-0"
                                    )}>
                                        {r.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {ratingStyle === "stars" && (
                        <div className="flex justify-center gap-1 sm:gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRate(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(null)}
                                    className={cn(
                                        "p-2 transition-transform duration-200 focus:outline-none",
                                        "hover:scale-110 active:scale-95"
                                    )}
                                >
                                    <Star
                                        className={cn(
                                            "w-12 h-12 sm:w-14 sm:h-14 transition-colors duration-200",
                                            (hoverRating !== null ? star <= hoverRating : rating !== null && star <= rating)
                                                ? "fill-chart-4 text-chart-4"
                                                : "fill-muted text-muted-foreground/40"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {ratingStyle === "number" && (
                        <div className="flex justify-between w-full max-w-sm mx-auto">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => handleRate(num)}
                                    onMouseEnter={() => setHoverRating(num)}
                                    onMouseLeave={() => setHoverRating(null)}
                                    className={cn(
                                        "w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full text-lg sm:text-xl font-bold transition-all duration-200 shadow-sm",
                                        "border-2 focus:outline-none focus:ring-2 focus:ring-primary/40",
                                        rating === num
                                            ? "border-primary bg-primary text-primary-foreground scale-110 shadow-md ring-4 ring-primary/20 z-10"
                                            : hoverRating === num
                                                ? "border-primary/50 bg-primary/10 text-primary scale-105"
                                                : "border-border bg-background text-muted-foreground hover:border-foreground/30"
                                    )}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    )}

                    {ratingStyle === "slider" && (
                        <div className="w-full space-y-6 pt-4 pb-2 max-w-sm mx-auto">
                            <input
                                type="range"
                                min="1"
                                max="5"
                                step="1"
                                value={rating !== null ? rating : hoverRating !== null ? hoverRating : 5}
                                onChange={(e) => setHoverRating(parseInt(e.target.value))}
                                onMouseUp={(e) => {
                                    const val = parseInt((e.target as HTMLInputElement).value);
                                    setHoverRating(null);
                                    handleRate(val);
                                }}
                                onTouchEnd={(e) => {
                                    const val = parseInt((e.target as HTMLInputElement).value);
                                    setHoverRating(null);
                                    handleRate(val);
                                }}
                                className="w-full cursor-pointer h-3 bg-muted rounded-lg appearance-none accent-primary hover:accent-primary transition-all touch-none"
                                style={{ touchAction: "none" }}
                            />
                            <div className="flex justify-between text-xs sm:text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                                <span>POOR</span>
                                <span>EXCELLENT</span>
                            </div>
                        </div>
                    )}

                    {ratingStyle === "radio" && (
                        <div className="flex flex-col gap-2.5 max-w-sm mx-auto w-full">
                            {RATINGS.map((r) => (
                                <button
                                    key={r.value}
                                    onClick={() => handleRate(r.value)}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 w-full text-left",
                                        "focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-[0.98]",
                                        rating === r.value
                                            ? "border-primary bg-primary/10 shadow-sm"
                                            : "border-border bg-background hover:border-primary/40 hover:bg-muted"
                                    )}
                                >
                                    <div className={cn(
                                        "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                        rating === r.value ? "border-primary" : "border-border"
                                    )}>
                                        {rating === r.value && <div className="h-3 w-3 rounded-full bg-primary animate-in zoom-in duration-200" />}
                                    </div>
                                    <span className={cn(
                                        "font-medium text-lg",
                                        rating === r.value ? "text-primary" : "text-foreground"
                                    )}>
                                        {r.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
        );
    }

    // ─── Render: Tag Selection (step 2) ─────────────────────────────────

    if (step === "tags") {
        return renderCardWrapper(
            <div className="p-8 pb-32 flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-400">
                    {/* Step indicator */}
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: resolvedBrandColor }} />
                        <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: resolvedBrandColor }} />
                        <div className="h-1.5 flex-1 bg-muted rounded-full" />
                    </div>

                    <div className="text-center space-y-1">
                        <h2 className="text-2xl font-bold text-foreground">{tagsHeading || "What did you like most?"}</h2>
                        <p className="text-muted-foreground text-sm">{tagsSubheading || "Tap to select what stood out"}</p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap justify-center gap-2.5 my-2">
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={cn(
                                    "px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                                    "border-2 active:scale-95",
                                    selectedTags.includes(tag)
                                        ? "text-primary-foreground scale-105 shadow-md"
                                        : "bg-background text-muted-foreground border-border hover:bg-muted"
                                )}
                                style={{
                                    backgroundColor: selectedTags.includes(tag) ? resolvedBrandColor : undefined,
                                    borderColor: selectedTags.includes(tag) ? resolvedBrandColor : undefined
                                }}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    {/* Everything button */}
                    <button
                        onClick={() => toggleTag("👍 Everything")}
                        className={cn(
                            "w-full h-13 py-3.5 rounded-2xl text-base font-semibold transition-all duration-200",
                            "border-2 active:scale-[0.98]",
                            selectedTags.includes("👍 Everything")
                                ? "text-primary-foreground shadow-md"
                                : "text-foreground border-border hover:bg-muted"
                        )}
                        style={{
                            backgroundColor: selectedTags.includes("👍 Everything") ? resolvedBrandColor : undefined,
                            borderColor: selectedTags.includes("👍 Everything") ? resolvedBrandColor : undefined
                        }}
                    >
                        👍 Everything!
                    </button>

                    <div className="h-2" /> {/* Extra spacing */}

                    {/* Staff selection (same step as tags — avoids a duplicate full-screen staff step) */}
                    {enableStaffSelection && staffNames.length > 0 && (
                        <div className="pt-4 border-t border-border">
                            <p className="text-center text-sm font-medium text-foreground mb-1">
                                Who served you?
                            </p>
                            <p className="text-center text-xs text-muted-foreground mb-3">
                                Select who helped you today (optional)
                            </p>
                            <div className="flex flex-wrap justify-center gap-2.5">
                                {staffNames.map((name) => (
                                    <button
                                        key={name}
                                        onClick={() => toggleStaff(name)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                                            "border-2 active:scale-95",
                                            selectedStaff.includes(name)
                                                ? "text-primary-foreground scale-105 shadow-md"
                                                : "bg-background text-muted-foreground border-border hover:bg-muted"
                                        )}
                                        style={{
                                            backgroundColor: selectedStaff.includes(name) ? resolvedBrandColor : undefined,
                                            borderColor: selectedStaff.includes(name) ? resolvedBrandColor : undefined
                                        }}
                                    >
                                        <span>👤</span> 
                                        {name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Continue button */}
                    <div className={cn(
                        "transition-all duration-300",
                        selectedTags.length > 0
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4 pointer-events-none h-0 overflow-hidden"
                    )}>
                        <button
                            className={cn(
                                "w-full h-14 rounded-2xl text-base font-semibold text-primary-foreground transition-all duration-300",
                                "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary",
                                "shadow-lg shadow-primary/20 hover:shadow-primary/30",
                                "active:scale-[0.98] flex items-center justify-center gap-2"
                            )}
                            onClick={handleTagsContinue}
                        >
                            Continue
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>

                    <button
                        className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors mx-auto"
                        onClick={() => {
                            setRating(null);
                            setSelectedTags([]);
                            setStep("rating");
                        }}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back
                    </button>
                </div>,
            "overflow-visible min-h-[450px] flex flex-col relative z-20"
        );
    }

    // ─── Render: Generating (loading) ───────────────────────────────────
    if (step === "generating") {
        return renderCardWrapper(
            <div className="px-8 py-20 text-center space-y-6">
                    {/* Step indicator */}
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-primary rounded-full" />
                        <div className="h-1.5 flex-1 bg-primary rounded-full" />
                        <div className="h-1.5 flex-1 bg-primary/70 rounded-full animate-pulse" />
                    </div>

                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse">
                                <Sparkles className="h-8 w-8 text-primary-foreground" />
                            </div>
                            <div className="absolute -top-1 -right-1 h-4 w-4 bg-chart-4 rounded-full animate-ping" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Crafting your review...</h2>
                        <p className="text-sm text-muted-foreground mt-1">Just a moment ✨</p>
                    </div>
                </div>
        );
    }

    // ─── Render: AI Review (step 3) ─────────────────────────────────────
    if (step === "review") {
        return renderCardWrapper(
            <div className="px-8 py-10 space-y-8 animate-in fade-in slide-in-from-right-4 duration-400">
                    {/* Step indicator */}
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-primary rounded-full" />
                        <div className="h-1.5 flex-1 bg-primary rounded-full" />
                        <div className="h-1.5 flex-1 bg-primary rounded-full" />
                    </div>

                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-bold text-foreground">
                            {googleHeading || "Would you post this on Google?"}
                        </h2>
                        <p className="text-muted-foreground text-sm">{googleSubheading || "Tap to edit, or post as-is"}</p>
                    </div>

                    {/* AI Generated Review */}
                    <div className="relative">
                        <div className="absolute -top-3 left-4 bg-background px-2">
                            <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                                <Sparkles className="h-3.5 w-3.5" />
                                AI Generated
                            </div>
                        </div>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            className="w-full min-h-[140px] text-base p-4 pt-5 rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-0 outline-none resize-none transition-colors bg-primary/10 leading-relaxed"
                        />
                    </div>

                    {/* Post to Google CTA */}
                    <button
                        className={cn(
                            "w-full h-14 rounded-2xl text-base font-semibold transition-all duration-300 relative overflow-hidden",
                            isRedirecting
                                ? "bg-muted cursor-wait ring-0"
                                : "text-primary-foreground shadow-lg hover:shadow-xl active:scale-[0.98]",
                            !isRedirecting && "disabled:opacity-60 disabled:cursor-not-allowed"
                        )}
                        style={{ backgroundColor: isRedirecting ? "var(--muted)" : resolvedBrandColor }}
                        onClick={handlePostToGoogle}
                        disabled={isSubmitting || isRedirecting || !reviewText.trim()}
                    >
                        {isRedirecting ? (
                            <>
                                {/* Progress Bar Animation */}
                                <div
                                    className="absolute top-0 left-0 h-full bg-primary/20 z-0 ease-linear"
                                    style={{
                                        width: `${progress}%`,
                                        transition: "width 2s linear"
                                    }}
                                />

                                <div className="relative z-10 flex items-center justify-center gap-2 text-foreground animate-in fade-in duration-300">
                                    <div className="bg-chart-2/15 text-chart-2 rounded-full p-0.5">
                                        <Check className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium">Review copied! Redirecting...</span>
                                </div>
                            </>
                        ) : (
                            isSubmitting ? (
                                <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" />
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Copy className="h-4 w-4" />
                                    <span>{googleButtonText || "Copy & Go to Google"}</span>
                                    <ExternalLink className="h-4 w-4 ml-1" />
                                </div>
                            )
                        )}
                    </button>

                    <button
                        className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors mx-auto"
                        onClick={() => setStep("tags")}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back
                    </button>
                </div>
        );
    }
    return null;
}
