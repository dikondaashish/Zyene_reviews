"use client";

import { useState } from "react";
import { CompactReviewRow } from "@/components/reviews/compact-review-row";
import { BulkReviewActionBar } from "@/components/reviews/bulk-review-action-bar";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square } from "lucide-react";
import type { ReviewManagementItem } from "@/types/components";

interface ReviewManagementProps {
    reviews: ReviewManagementItem[];
    businessId: string;
    resultCount?: number;
    loading?: boolean;
    googleMapsListingUrl?: string | null;
    /** Starter+ / Professional / Enterprise ,  required for AI suggest-reply */
    planAllowsAiReplies: boolean;
    onRefresh?: () => void;
}

export function ReviewManagement({
    reviews,
    resultCount,
    loading = false,
    businessId,
    googleMapsListingUrl = null,
    planAllowsAiReplies,
    onRefresh,
}: ReviewManagementProps) {
    const totalCount = resultCount ?? reviews.length;
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelect = (id: string, selected: boolean) => {
        const newSet = new Set(selectedIds);
        if (selected) newSet.add(id);
        else newSet.delete(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (reviews.every((review) => selectedIds.has(review.id))) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(reviews.map(r => r.id)));
        }
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    const visibleSelectedIds = reviews.filter(review => selectedIds.has(review.id)).map(review => review.id);
    const selectedCount = visibleSelectedIds.length;
    const allSelected = reviews.length > 0 && selectedCount === reviews.length;

    return (
        <div className="min-w-0">
            {/* Selection Controls */}
            {reviews.length > 0 && (
                <div className="flex min-w-0 flex-wrap items-center gap-2 border-b border-border bg-muted/25 px-3 py-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSelectAll}
                        className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
                    >
                        {allSelected ? <CheckSquare className="mr-2 text-primary size-3.5" /> : <Square className="mr-2 size-3.5" />}
                        {allSelected ? "Deselect all" : "Select page"}
                    </Button>
                    <span role="status" className="ml-auto text-xs tabular-nums text-muted-foreground">
                        {loading ? "Updating reviews…" : `${totalCount.toLocaleString("en-US")} ${totalCount === 1 ? "review" : "reviews"}`}
                    </span>
                    {selectedCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                            {selectedCount} selected
                        </span>
                    )}
                </div>
            )}

            <div className="divide-y divide-border">
                {reviews.map((review) => (
                    <CompactReviewRow
                        key={review.id}
                        review={review}
                        googleMapsListingUrl={googleMapsListingUrl}
                        planAllowsAiReplies={planAllowsAiReplies}
                        isSelected={selectedIds.has(review.id)}
                        onSelect={toggleSelect}
                        onRefresh={onRefresh}
                    />
                ))}
            </div>

            <BulkReviewActionBar
                selectedIds={visibleSelectedIds}
                onClearSelection={clearSelection}
                businessId={businessId}
                onRefresh={onRefresh}
            />
        </div>
    );
}
