"use client";

import { useState } from "react";
import { Star, Loader2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Category → Tag mapping ────────────────────────────────────────────
const CATEGORY_TAGS: Record<string, string[]> = {
    restaurant: ["Food", "Service", "Ambiance", "Prices", "Portions", "Speed", "Cleanliness", "Menu Variety"],
    cafe: ["Coffee", "Food", "Ambiance", "Service", "Prices", "Wi-Fi", "Seating"],
    bar: ["Drinks", "Atmosphere", "Service", "Music", "Prices", "Food", "Crowd"],
    salon: ["Service", "Skill", "Cleanliness", "Ambiance", "Prices", "Products", "Relaxation"],
    spa: ["Service", "Relaxation", "Cleanliness", "Ambiance", "Treatments", "Staff", "Value"],
    gym: ["Equipment", "Trainers", "Cleanliness", "Prices", "Classes", "Atmosphere", "Hours"],
    fitness: ["Trainers", "Equipment", "Classes", "Atmosphere", "Cleanliness", "Results", "Community"],
    medical: ["Staff", "Professionalism", "Wait Time", "Cleanliness", "Communication", "Care"],
    dental: ["Staff", "Professionalism", "Comfort", "Cleanliness", "Communication", "Pain-Free"],
    retail: ["Selection", "Prices", "Staff", "Quality", "Store Layout", "Returns"],
    auto: ["Honesty", "Speed", "Prices", "Quality", "Communication", "Professionalism"],
    hotel: ["Room", "Cleanliness", "Staff", "Location", "Amenities", "Value"],
    service: ["Quality", "Professionalism", "Communication", "Timeliness", "Value", "Expertise"],
    other: ["Quality", "Service", "Value", "Atmosphere", "Staff", "Experience"],
};

// ─── Props ──────────────────────────────────────────────────────────────
interface PublicReviewFlowProps {
    businessId: string;
    businessName: string;
    businessCategory: string;
    requestId?: string;
    googleUrl?: string;
}

// ─── Step type ──────────────────────────────────────────────────────────
type FlowStep = "rating" | "tags" | "generating" | "review" | "thankyou" | "negative";

// ─── Progress dots ──────────────────────────────────────────────────────
function ProgressDots({ current, total }: { current: number; total: number }) {
    return (
        <div className="flex justify-center gap-2 mb-6">
            {Array.from({ length: total }, (_, i) => (
                <div
                    key={i}
                    className={cn(
                        "h-2 w-2 rounded-full transition-all duration-300",
                        i < current ? "bg-blue-600 w-6" : "bg-slate-200"
                    )}
                />
            ))}
        </div>
    );
}

// ─── Main component ─────────────────────────────────────────────────────
export function PublicReviewFlow({
    businessId,
    businessName,
    businessCategory,
    requestId,
    googleUrl,
}: PublicReviewFlowProps) {
    const [step, setStep] = useState<FlowStep>("rating");
    const [rating, setRating] = useState<number | null>(null);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [reviewText, setReviewText] = useState("");
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const supabase = createClient();

    // Resolve tags for this business category
    const categoryKey = businessCategory.toLowerCase();
    const tags = [...(CATEGORY_TAGS[categoryKey] || CATEGORY_TAGS.other), "Everything"];

    // ─── Handlers ───────────────────────────────────────────────────────

    const handleRate = (stars: number) => {
        setRating(stars);
        if (stars >= 4) {
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

        try {
            const res = await fetch("/api/review-flow/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessName,
                    businessCategory: categoryKey,
                    rating,
                    selectedTags,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to generate");

            setReviewText(data.reviewText);
            setStep("review");
        } catch (error) {
            console.error("Generation error:", error);
            // Fallback
            const firstTag = selectedTags[0] || "experience";
            setReviewText(
                `Great experience at ${businessName}! Really loved the ${firstTag.toLowerCase()}. Would definitely come back.`
            );
            setStep("review");
        }
    };

    const handlePostToGoogle = async () => {
        setIsSubmitting(true);

        try {
            // Copy to clipboard
            await navigator.clipboard.writeText(reviewText);
            toast.success("Review copied to clipboard!", {
                description: "Paste it on Google Reviews.",
            });
        } catch {
            // Clipboard API might fail on some browsers
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
                // Organic visit — create a tracking record
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

        // Redirect after brief delay
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
        setIsSubmitting(true);

        try {
            const { error } = await supabase.from("private_feedback").insert({
                business_id: businessId,
                review_request_id: requestId,
                rating: rating,
                content: feedback,
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

    // ─── Render: Thank You (final) ──────────────────────────────────────

    if (step === "thankyou") {
        return (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500 py-10">
                <div className="flex justify-center">
                    <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                        <span className="text-5xl">🎉</span>
                    </div>
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Thank You!</h2>
                    <p className="text-slate-600 text-lg">We appreciate your feedback.</p>
                </div>
                <p className="text-xs text-slate-400 pt-4">Powered by Zyene</p>
            </div>
        );
    }

    // ─── Render: Negative feedback (1-3 stars) ──────────────────────────

    if (step === "negative") {
        return (
            <div className="space-y-6 text-left animate-in slide-in-from-right duration-300 w-full">
                <ProgressDots current={2} total={3} />
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">We&apos;re sorry to hear that.</h2>
                    <p className="text-slate-600 text-lg">What can we do better?</p>
                </div>

                <Textarea
                    placeholder="Tell us about your experience..."
                    className="min-h-[150px] text-lg p-4 resize-none"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    autoFocus
                />

                <Button
                    size="lg"
                    className="w-full h-14 text-lg font-semibold bg-slate-900 hover:bg-slate-800"
                    onClick={handleSubmitFeedback}
                    disabled={isSubmitting || !feedback.trim()}
                >
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>

                <div className="text-center pt-2">
                    <button
                        className="text-slate-400 text-sm hover:text-slate-600 underline-offset-4 hover:underline"
                        onClick={() => {
                            setRating(null);
                            setStep("rating");
                        }}
                    >
                        Cancel
                    </button>
                </div>
                <p className="text-xs text-slate-400 text-center pt-2">Powered by Zyene</p>
            </div>
        );
    }

    // ─── Render: Star Rating (step 1) ───────────────────────────────────

    if (step === "rating") {
        return (
            <div className="space-y-10 py-8 animate-in fade-in duration-300">
                <ProgressDots current={1} total={4} />
                <h2 className="text-3xl font-bold text-slate-900 leading-tight">
                    How was your <br className="hidden sm:block" /> experience?
                </h2>

                <div className="flex justify-center gap-2 sm:gap-4 touch-none">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => handleRate(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                            aria-label={`Rate ${star} stars`}
                        >
                            <Star
                                className={cn(
                                    "h-12 w-12 sm:h-16 sm:w-16 transition-all duration-200",
                                    (hoverRating !== null ? star <= hoverRating : rating !== null && star <= rating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-slate-200 fill-slate-50"
                                )}
                                strokeWidth={1.5}
                            />
                        </button>
                    ))}
                </div>
                <p className="text-sm text-slate-400">Tap a star to rate</p>
                <p className="text-xs text-slate-400 pt-4">Powered by Zyene</p>
            </div>
        );
    }

    // ─── Render: Tag Selection (step 2) ─────────────────────────────────

    if (step === "tags") {
        return (
            <div className="space-y-6 animate-in slide-in-from-right duration-300 w-full">
                <ProgressDots current={2} total={4} />
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">What did you like the most?</h2>
                    <p className="text-sm text-slate-400">TAP ON AN OPTION</p>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    {tags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                                selectedTags.includes(tag)
                                    ? "bg-[#2563EB] text-white border-[#2563EB] scale-105"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                            )}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                <div
                    className={cn(
                        "transition-all duration-300",
                        selectedTags.length > 0
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4 pointer-events-none"
                    )}
                >
                    <Button
                        size="lg"
                        className="w-full h-14 text-lg font-semibold bg-[#2563EB] hover:bg-blue-700"
                        onClick={handleGenerateReview}
                    >
                        Continue →
                    </Button>
                </div>

                <button
                    className="text-slate-400 text-sm hover:text-slate-600 underline-offset-4 hover:underline"
                    onClick={() => {
                        setRating(null);
                        setSelectedTags([]);
                        setStep("rating");
                    }}
                >
                    ← Back
                </button>
                <p className="text-xs text-slate-400 pt-2">Powered by Zyene</p>
            </div>
        );
    }

    // ─── Render: Generating (loading) ───────────────────────────────────

    if (step === "generating") {
        return (
            <div className="space-y-6 py-16 animate-in fade-in duration-300">
                <ProgressDots current={3} total={4} />
                <div className="flex justify-center">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Writing your review...</h2>
                    <p className="text-sm text-slate-400 mt-1">Just a moment</p>
                </div>
                <p className="text-xs text-slate-400 pt-4">Powered by Zyene</p>
            </div>
        );
    }

    // ─── Render: AI Review (step 3) ─────────────────────────────────────

    if (step === "review") {
        return (
            <div className="space-y-5 animate-in slide-in-from-right duration-300 w-full">
                <ProgressDots current={3} total={4} />
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">
                        Would you be willing to leave a review on Google?
                    </h2>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left">
                    <Textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="min-h-[120px] text-base p-0 border-0 bg-transparent resize-none focus-visible:ring-0 shadow-none"
                    />
                    <p className="text-xs text-slate-400 mt-2">Tap to make edits if you&apos;d like.</p>
                </div>

                <Button
                    size="lg"
                    className="w-full h-14 text-lg font-semibold bg-[#4285F4] hover:bg-[#3367D6] text-white"
                    onClick={handlePostToGoogle}
                    disabled={isSubmitting || !reviewText.trim()}
                >
                    {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                        <Copy className="h-5 w-5 mr-2" />
                    )}
                    {isSubmitting ? "Redirecting..." : "Post to Google"}
                </Button>

                {!googleUrl && (
                    <p className="text-xs text-slate-500">
                        We&apos;ll copy your review and open Google Maps so you can paste it.
                    </p>
                )}

                <button
                    className="text-slate-400 text-sm hover:text-slate-600 underline-offset-4 hover:underline"
                    onClick={() => setStep("tags")}
                >
                    ← Back
                </button>
                <p className="text-xs text-slate-400 pt-2">Powered by Zyene</p>
            </div>
        );
    }

    return null;
}
