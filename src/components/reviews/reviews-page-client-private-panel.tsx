"use client";

import { Lock } from "lucide-react";
import { PrivateFeedbackCard } from "./private-feedback-card";
import type { PrivateFeedback } from "./private-feedback-card";

interface ReviewsPageClientPrivatePanelProps {
    loading: boolean;
    reviews: PrivateFeedback[];
}

export function ReviewsPageClientPrivatePanel({ loading, reviews }: ReviewsPageClientPrivatePanelProps) {
    return (
        <div className={`grid gap-4 ${loading ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}`}>
            {reviews && reviews.length > 0 ? (
                reviews.map((feedback) => <PrivateFeedbackCard key={feedback.id} feedback={feedback} />)
            ) : (
                <div className="text-center py-20 flex flex-col items-center justify-center border rounded-lg bg-muted/30 border-dashed">
                    <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-destructive/40" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">No private feedback yet</h3>
                    <p className="text-muted-foreground max-w-sm mt-1">
                        Negative feedback (1-3 stars) from your review flow will appear here privately.
                    </p>
                </div>
            )}
        </div>
    );
}
