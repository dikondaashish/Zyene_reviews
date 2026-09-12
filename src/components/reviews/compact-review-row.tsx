"use client";

import { useState } from "react";
import type { ReviewManagementItem } from "@/types/components";
import { ReviewCard } from "@/components/reviews/review-card";

export function CompactReviewRow(props: {
    review: ReviewManagementItem;
    googleMapsListingUrl: string | null;
    planAllowsAiReplies: boolean;
    isSelected: boolean;
    onSelect: (id: string, selected: boolean) => void;
    onRefresh?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const { review, isSelected, onSelect } = props;
    const date = typeof review.review_date === "string" ? new Date(review.review_date) : null;
    const author = typeof review.author_name === "string" ? review.author_name : "Anonymous";
    const rating = typeof review.rating === "number" ? review.rating : 0;
    const platform = typeof review.platform === "string" ? review.platform : "Review";
    const text = typeof review.text === "string" ? review.text.trim() : "";
    return <div className="min-w-0 rounded-xl border border-border bg-card">
        <div className="flex min-w-0 items-start gap-3 p-4">
            <input type="checkbox" className="mt-1 size-4 shrink-0 accent-primary" aria-label={`Select review by ${author}`} checked={isSelected} onChange={(e) => onSelect(review.id, e.target.checked)} />
            <button type="button" className="min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-ring" aria-expanded={open} onClick={() => setOpen(!open)}>
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <strong>{author}</strong>
                    <span aria-label={`${rating} out of 5 stars`}>{rating}/5 ★</span>
                    <span className="text-muted-foreground">{platform}</span>
                    {date && !Number.isNaN(date.getTime()) && <time dateTime={date.toISOString()} className="text-muted-foreground">{date.toLocaleDateString()}</time>}
                    <span className="text-primary">{review.response_status === "responded" ? "Responded" : review.response_status === "ignored" ? "Ignored" : "Needs reply"}</span>
                </span>
                <span className="mt-2 line-clamp-2 block text-sm text-muted-foreground">{text || "Rating-only review"}</span>
                <span className="mt-2 block text-xs font-medium text-primary">{open ? "Close details" : "Read and reply"}</span>
            </button>
        </div>
        {open && <div className="border-t border-border p-2"><ReviewCard {...props} review={review as never} /></div>}
    </div>;
}
