"use client";

import { Lock } from "lucide-react";
import { PanelLoading } from "@/components/dashboard/panel-loading";
import { PrivateFeedbackCard } from "@/components/reviews/private-feedback-card";
import type { PrivateFeedback } from "@/components/reviews/private-feedback-card";

interface ReviewsPageClientPrivatePanelProps {
    loading: boolean;
    reviews: PrivateFeedback[];
}

export function ReviewsPageClientPrivatePanel({ loading, reviews }: ReviewsPageClientPrivatePanelProps) {
    if (loading && reviews.length === 0) return <PanelLoading label="private feedback" className="h-[360px] rounded-xl border border-border bg-card" />;
    return (
        <div aria-label="Private feedback inbox" aria-busy={loading} inert={loading} className={`grid gap-4 ${loading ? "opacity-60 transition-opacity" : "transition-opacity"}`}>
            {reviews && reviews.length > 0 ? (
                reviews.map((feedback) => <PrivateFeedbackCard key={feedback.id} feedback={feedback} />)
            ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-16 text-center">
                    <div className="bg-muted rounded-full flex items-center justify-center mb-4 size-12">
                        <Lock className="text-muted-foreground size-6" />
                    </div>
                    <h2 className="text-lg font-medium text-foreground">No private feedback yet</h2>
                    <p className="text-muted-foreground max-w-sm mt-1">
                        Feedback shared privately through your review flow will appear here. Only your team can see it.
                    </p>
                </div>
            )}
        </div>
    );
}
