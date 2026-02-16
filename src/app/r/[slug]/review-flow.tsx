"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PublicReviewFlowProps {
    businessId: string;
    requestId?: string;
    googleUrl?: string; // or null if not found
}

export function PublicReviewFlow({
    businessId,
    requestId,
    googleUrl,
}: PublicReviewFlowProps) {
    const [rating, setRating] = useState<number | null>(null);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [feedback, setFeedback] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = createClient();

    // Handle Star Click
    const handleRate = (stars: number) => {
        setRating(stars);

        if (stars >= 4) {
            // Happy Path
            if (googleUrl) {
                toast.success("Redirecting...", {
                    description: "Taking you to Google Reviews...",
                });
                setTimeout(() => {
                    window.location.href = googleUrl;
                }, 1500);
            } else {
                setSubmitted(true);
            }
        }
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
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            if (requestId) {
                await supabase.from("review_requests").update({
                    review_left: true,
                    status: "review_left",
                }).eq("id", requestId);
            }

            setSubmitted(true);
            toast.success("Thank you!", {
                description: "Your feedback has been received.",
            });
        } catch (error) {
            console.error("Feedback error:", error);
            toast.error("Error", {
                description: "Failed to submit feedback. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
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
            </div>
        );
    }

    // HAPPY PATH REDIRECT MESSAGE (If redirected but user comes back or blocked)
    if (rating && rating >= 4 && googleUrl) {
        return (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500 py-10">
                <div className="flex justify-center">
                    <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-5xl">⭐</span>
                    </div>
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Thank You!</h2>
                    <p className="text-slate-600 text-lg">Redirecting you to Google...</p>
                </div>
            </div>
        );
    }

    // FEEDBACK FORM (1-3 Stars)
    if (rating && rating <= 3) {
        return (
            <div className="space-y-6 text-left animate-in slide-in-from-bottom duration-500 w-full">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">We're sorry to hear that.</h2>
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
                        onClick={() => setRating(null)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // DEFAULT: STAR RATING
    return (
        <div className="space-y-10 py-8">
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
                                (hoverRating !== null ? star <= hoverRating : (rating !== null && star <= rating))
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-slate-200 fill-slate-50"
                            )}
                            strokeWidth={1.5}
                        />
                    </button>
                ))}
            </div>
            <p className="text-sm text-slate-400">Tap a star to rate</p>
        </div>
    );
}
