"use client";

import { useState, useEffect } from "react";
import { Loader2, Copy, ExternalLink, Sparkles, Send, ArrowLeft, Mail, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    { emoji: "😍", label: "Excellent", value: 5, color: "from-emerald-400 to-emerald-500" },
    { emoji: "😊", label: "Good", value: 4, color: "from-green-400 to-green-500" },
    { emoji: "😐", label: "OK", value: 3, color: "from-amber-400 to-amber-500" },
    { emoji: "😕", label: "Bad", value: 2, color: "from-orange-400 to-orange-500" },
    { emoji: "😞", label: "Awful", value: 1, color: "from-red-400 to-red-500" },
];

// ─── Props ──────────────────────────────────────────────────────────────
export interface PublicReviewFlowProps {
    businessId: string;
    businessName: string;
    businessCategory: string;
    requestId?: string;
    googleUrl?: string;
    brandColor?: string;
    logoUrl?: string;
    minStars?: number;
    welcomeMsg?: string;
    apologyMsg?: string;
    isPreview?: boolean;
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
    brandColor = "#2563EB", // Default Blue
    logoUrl,
    minStars = 4,
    welcomeMsg,
    apologyMsg,
    isPreview = false,
}: PublicReviewFlowProps) {
    const [step, setStep] = useState<FlowStep>("rating");
    const [rating, setRating] = useState<number | null>(null);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [reviewText, setReviewText] = useState("");
    const [feedback, setFeedback] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const supabase = createClient();

    // Resolve tags for this business category
    const categoryKey = businessCategory.toLowerCase();
    const tags = CATEGORY_TAGS[categoryKey] || CATEGORY_TAGS.other;

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
        if (stars >= minStars) {
            setStep("tags");
        } else {
            setStep("negative");
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
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
                    businessName,
                    businessCategory: categoryKey,
                    rating,
                    selectedTags: selectedTags.map((t) => t.replace(/^[^\s]+\s/, "")), // Strip emojis for AI
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

    const handlePostToGoogle = async () => {
        if (isPreview) {
            toast.info("Preview Mode: This would open Google Maps.");
            setStep("thankyou");
            return;
        }
        setIsSubmitting(true);

        try {
            await navigator.clipboard.writeText(reviewText);
            toast.success("Review copied to clipboard!", {
                description: "Paste it on Google Reviews.",
            });
        } catch {
            toast.info("Tap and hold the review text to copy it.");
        }

        // Track completion
        try {
            if (requestId) {
                await supabase
                    .from("review_requests")
                    .update({
                        status: "completed",
                        rating_given: rating,
                        tags_selected: selectedTags,
                        ai_review_text: reviewText,
                        completed_at: new Date().toISOString(),
                    })
                    .eq("id", requestId);
            } else {
                await supabase.from("review_requests").insert({
                    business_id: businessId,
                    channel: "sms",
                    trigger_source: "manual",
                    status: "completed",
                    rating_given: rating,
                    tags_selected: selectedTags,
                    ai_review_text: reviewText,
                    completed_at: new Date().toISOString(),
                });
            }
        } catch (err) {
            console.error("Tracking error:", err);
        }

        setTimeout(() => {
            if (googleUrl) {
                window.location.href = googleUrl;
            } else {
                setStep("thankyou");
            }
        }, 600);
    };

    const handleSubmitFeedback = async () => {
        if (!rating) return;

        if (isPreview) {
            toast.info("Preview Mode: Feedback submitted.");
            setStep("thankyou");
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase.from("private_feedback").insert({
                business_id: businessId,
                review_request_id: requestId,
                rating: rating,
                content: feedback,
                customer_email: customerEmail || null,
                created_at: new Date().toISOString(),
            });
            if (error) throw error;

            if (requestId) {
                await supabase
                    .from("review_requests")
                    .update({
                        status: "feedback_left",
                        review_left: true,
                        rating_given: rating,
                    })
                    .eq("id", requestId);
            }

            setStep("thankyou");
            toast.success("Thank you!", {
                description: "Your feedback has been received.",
            });
        } catch (error) {
            console.error("Feedback error:", error);
            toast.error("Failed to submit feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Shared card wrapper ────────────────────────────────────────────

    const CardWrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <div
            className={cn(
                "min-h-screen w-full flex flex-col items-center justify-center p-6 transition-all duration-500",
                !mounted && "opacity-0",
                mounted && "opacity-100"
            )}
            style={{ backgroundColor: brandColor }}
        >
            <div className={cn(
                "relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl shadow-black/10 overflow-hidden",
                "transform transition-all duration-500",
                mounted ? "translate-y-0 scale-100" : "translate-y-4 scale-95",
                className
            )}>
                {children}
            </div>

            {/* Powered by footer - Outside card */}
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-white/80 font-medium">Powered by</span>
                    <span className="text-white font-bold text-xs flex items-center gap-1">
                        <Sparkles className="h-3 w-3 fill-white" />
                        Zyene
                    </span>
                </div>
            </div>
        </div>
    );

    // ─── Render: Thank You (final) ──────────────────────────────────────

    if (step === "thankyou") {
        return (
            <CardWrapper>
                <div className="px-8 py-16 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="relative inline-flex">
                        <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-5xl animate-bounce" style={{ animationDuration: "2s" }}>🎉</span>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
                        <p className="text-slate-500 font-medium">
                            Your feedback means the world to us.
                        </p>
                    </div>
                </div>
            </CardWrapper>
        );
    }

    // ─── Render: Negative feedback (1-3 stars) ──────────────────────────

    if (step === "negative") {
        const selectedRating = RATINGS.find((r) => r.value === rating);
        return (
            <CardWrapper>
                <div className="px-6 py-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
                    {/* Header with emoji */}
                    <div className="text-center space-y-2">
                        <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                            <span className="text-4xl">{selectedRating?.emoji || "😕"}</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {apologyMsg || "Sorry about that"}
                        </h2>
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">
                            How can we do better?
                        </p>
                    </div>

                    {/* Feedback textarea */}
                    <div className="space-y-4">
                        <textarea
                            placeholder="Tell us what happened..."
                            className="w-full min-h-[120px] text-base p-4 rounded-xl border-2 border-slate-100 focus:border-slate-300 focus:ring-0 outline-none resize-none transition-colors bg-slate-50 placeholder:text-slate-400"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            autoFocus
                        />

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="email"
                                placeholder="Email (optional)"
                                className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-slate-100 focus:border-slate-300 focus:ring-0 outline-none transition-colors bg-slate-50 text-sm placeholder:text-slate-400"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-3 pt-2">
                        <button
                            className={cn(
                                "w-full h-12 rounded-xl text-base font-bold text-white transition-all duration-300",
                                "shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
                                "flex items-center justify-center gap-2"
                            )}
                            style={{ backgroundColor: brandColor }}
                            onClick={handleSubmitFeedback}
                            disabled={isSubmitting || !feedback.trim()}
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            {isSubmitting ? "Sending..." : "Send Feedback"}
                        </button>

                        <button
                            className="w-full h-10 flex items-center justify-center gap-1 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
                            onClick={() => {
                                setRating(null);
                                setStep("rating");
                            }}
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back
                        </button>
                    </div>
                </div>
            </CardWrapper>
        );
    }

    // ─── Render: Star Rating (step 1) ───────────────────────────────────

    if (step === "rating") {
        return (
            <CardWrapper>
                <div className="px-6 py-12 flex flex-col items-center text-center space-y-8">
                    {/* Business Name */}
                    <div className="space-y-2">
                        <h1 className="text-xl font-bold text-slate-900">{businessName}</h1>
                    </div>

                    {/* Question wrapper with border like in design */}
                    <div className="w-full border-2 border-slate-100 rounded-2xl p-6 space-y-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            {welcomeMsg || "How was your experience?"}
                        </h2>

                        {/* Emoji ratings */}
                        <div className="flex justify-center gap-3">
                            {RATINGS.map((r) => (
                                <button
                                    key={r.value}
                                    onClick={() => handleRate(r.value)}
                                    onMouseEnter={() => setHoverRating(r.value)}
                                    onMouseLeave={() => setHoverRating(null)}
                                    className="group relative transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                                >
                                    <span className={cn(
                                        "text-4xl filter transition-all duration-200",
                                        hoverRating === r.value ? "grayscale-0 drop-shadow-md" : "grayscale opacity-70 hover:grayscale-0 hover:opacity-100"
                                    )}>
                                        {r.emoji}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                            Tap on an option
                        </p>
                    </div>
                </div>
            </CardWrapper>
        );
    }

    // ─── Render: Tag Selection (step 2) ─────────────────────────────────

    if (step === "tags") {
        return (
            <CardWrapper>
                <div className="px-8 py-10 space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
                    {/* Step indicator */}
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: brandColor }} />
                        <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: brandColor }} />
                        <div className="h-1.5 flex-1 bg-slate-200 rounded-full" />
                    </div>

                    <div className="text-center space-y-1">
                        <h2 className="text-2xl font-bold text-slate-900">What did you like most?</h2>
                        <p className="text-slate-500 text-sm">Tap to select what stood out</p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap justify-center gap-2.5">
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={cn(
                                    "px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                                    "border-2 active:scale-95",
                                    selectedTags.includes(tag)
                                        ? "text-white scale-105 shadow-md"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-gray-50"
                                )}
                                style={{
                                    backgroundColor: selectedTags.includes(tag) ? brandColor : undefined,
                                    borderColor: selectedTags.includes(tag) ? brandColor : undefined
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
                                ? "text-white shadow-md"
                                : "text-slate-700 border-slate-200 hover:bg-gray-50"
                        )}
                        style={{
                            backgroundColor: selectedTags.includes("👍 Everything") ? brandColor : undefined,
                            borderColor: selectedTags.includes("👍 Everything") ? brandColor : undefined
                        }}
                    >
                        👍 Everything!
                    </button>

                    {/* Continue button */}
                    <div className={cn(
                        "transition-all duration-300",
                        selectedTags.length > 0
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4 pointer-events-none h-0 overflow-hidden"
                    )}>
                        <button
                            className={cn(
                                "w-full h-14 rounded-2xl text-base font-semibold text-white transition-all duration-300",
                                "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                                "shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30",
                                "active:scale-[0.98] flex items-center justify-center gap-2"
                            )}
                            onClick={handleGenerateReview}
                        >
                            Continue
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>

                    <button
                        className="flex items-center gap-1 text-slate-400 text-sm hover:text-slate-600 transition-colors mx-auto"
                        onClick={() => {
                            setRating(null);
                            setSelectedTags([]);
                            setStep("rating");
                        }}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back
                    </button>
                </div>
            </CardWrapper>
        );
    }

    // ─── Render: Generating (loading) ───────────────────────────────────

    if (step === "generating") {
        return (
            <CardWrapper>
                <div className="px-8 py-20 text-center space-y-6">
                    {/* Step indicator */}
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-blue-600 rounded-full" />
                        <div className="h-1.5 flex-1 bg-blue-600 rounded-full" />
                        <div className="h-1.5 flex-1 bg-blue-400 rounded-full animate-pulse" />
                    </div>

                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse">
                                <Sparkles className="h-8 w-8 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-400 rounded-full animate-ping" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Crafting your review...</h2>
                        <p className="text-sm text-slate-500 mt-1">Just a moment ✨</p>
                    </div>
                </div>
            </CardWrapper>
        );
    }

    // ─── Render: AI Review (step 3) ─────────────────────────────────────

    if (step === "review") {
        return (
            <CardWrapper>
                <div className="px-8 py-10 space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
                    {/* Step indicator */}
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-blue-600 rounded-full" />
                        <div className="h-1.5 flex-1 bg-blue-600 rounded-full" />
                        <div className="h-1.5 flex-1 bg-blue-600 rounded-full" />
                    </div>

                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-bold text-slate-900">
                            Would you post this on Google?
                        </h2>
                        <p className="text-slate-500 text-sm">Tap to edit, or post as-is</p>
                    </div>

                    {/* AI Generated Review */}
                    <div className="relative">
                        <div className="absolute -top-3 left-4 bg-white px-2">
                            <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                                <Sparkles className="h-3.5 w-3.5" />
                                AI Generated
                            </div>
                        </div>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            className="w-full min-h-[140px] text-base p-4 pt-5 rounded-2xl border-2 border-blue-200 focus:border-blue-500 focus:ring-0 outline-none resize-none transition-colors bg-blue-50/30 leading-relaxed"
                        />
                    </div>

                    {/* Post to Google CTA */}
                    <button
                        className={cn(
                            "w-full h-14 rounded-2xl text-base font-semibold text-white transition-all duration-300",
                            "shadow-lg hover:shadow-xl",
                            "active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
                            "flex items-center justify-center gap-2"
                        )}
                        style={{ backgroundColor: brandColor }}
                        onClick={handlePostToGoogle}
                        disabled={isSubmitting || !reviewText.trim()}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Copy className="h-4 w-4" />
                                <span>Copy & Go to Google</span>
                                <ExternalLink className="h-4 w-4 ml-1" />
                            </>
                        )}
                    </button>

                    <button
                        className="flex items-center gap-1 text-slate-400 text-sm hover:text-slate-600 transition-colors mx-auto"
                        onClick={() => setStep("tags")}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back
                    </button>
                </div>
            </CardWrapper >
        );
    }

    return null;
}
