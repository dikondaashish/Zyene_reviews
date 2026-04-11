"use client";

import { useState } from "react";
import { ReviewCard } from "./review-card";
import { BulkReviewActionBar } from "./bulk-review-action-bar";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square } from "lucide-react";
import type { ReviewManagementItem } from "@/types/components";

interface ReviewManagementProps {
    reviews: ReviewManagementItem[];
    businessId: string;
    googleMapsListingUrl?: string | null;
    /** Starter+ / Professional / Enterprise — required for AI suggest-reply */
    planAllowsAiReplies: boolean;
    onRefresh?: () => void;
}

export function ReviewManagement({
    reviews,
    businessId,
    googleMapsListingUrl = null,
    planAllowsAiReplies,
    onRefresh,
}: ReviewManagementProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelect = (id: string, selected: boolean) => {
        const newSet = new Set(selectedIds);
        if (selected) newSet.add(id);
        else newSet.delete(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === reviews.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(reviews.map(r => r.id)));
        }
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    const selectedCount = selectedIds.size;
    const allSelected = reviews.length > 0 && selectedCount === reviews.length;

    return (
        <div className="space-y-4">
            {/* Selection Controls */}
            {reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSelectAll}
                        className="text-xs text-slate-500 hover:text-slate-900 h-8 px-2"
                    >
                        {allSelected ? <CheckSquare className="w-3.5 h-3.5 mr-2 text-blue-600" /> : <Square className="w-3.5 h-3.5 mr-2" />}
                        {allSelected ? "Deselect All" : "Select All on Page"}
                    </Button>
                    {selectedCount > 0 && (
                        <span className="text-xs text-slate-400">
                            {selectedCount} selected
                        </span>
                    )}
                </div>
            )}

            <div className="grid gap-4">
                {reviews.map((review) => (
                    <ReviewCard
                        key={review.id}
                        review={review as any}
                        googleMapsListingUrl={googleMapsListingUrl}
                        planAllowsAiReplies={planAllowsAiReplies}
                        isSelected={selectedIds.has(review.id)}
                        onSelect={toggleSelect}
                        onRefresh={onRefresh}
                    />
                ))}
            </div>

            <BulkReviewActionBar
                selectedIds={Array.from(selectedIds)}
                onClearSelection={clearSelection}
                businessId={businessId}
                onRefresh={onRefresh}
            />
        </div>
    );
}
