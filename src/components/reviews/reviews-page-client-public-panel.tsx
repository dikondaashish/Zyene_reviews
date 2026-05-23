"use client";

import { ReviewsFilters } from "./reviews-filters";
import { ReviewManagement } from "./review-management";
import { MessageSquare } from "lucide-react";
import { SyncButton } from "@/components/dashboard/sync-button";
import type { ReviewManagementItem } from "@/types/components";

interface ReviewsPageClientPublicPanelProps {
    businessId: string;
    googleMapsListingUrl?: string | null;
    planAllowsAiReplies: boolean;
    filters: { status: string; rating: string; sort: string };
    loading: boolean;
    reviews: ReviewManagementItem[];
    isImportingGoogleReviews: boolean;
    publicCount: number;
    onFilterChange: (key: string, value: string) => void;
    onRefresh: () => void;
}

export function ReviewsPageClientPublicPanel({
    businessId,
    googleMapsListingUrl,
    planAllowsAiReplies,
    filters,
    loading,
    reviews,
    isImportingGoogleReviews,
    publicCount,
    onFilterChange,
    onRefresh,
}: ReviewsPageClientPublicPanelProps) {
    return (
        <>
            <ReviewsFilters filters={filters} onFilterChange={onFilterChange} />
            <div className={loading ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}>
                {reviews && reviews.length > 0 ? (
                    <ReviewManagement
                        reviews={reviews}
                        businessId={businessId}
                        googleMapsListingUrl={googleMapsListingUrl}
                        planAllowsAiReplies={planAllowsAiReplies}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="text-center py-20 flex flex-col items-center justify-center border rounded-lg bg-muted/30 border-dashed">
                        <div className="bg-muted rounded-full flex items-center justify-center mb-4 size-12">
                            <MessageSquare className="text-muted-foreground size-6" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">
                            {isImportingGoogleReviews
                                ? "Importing your Google reviews"
                                : publicCount === 0
                                  ? "No reviews synced yet"
                                  : "No reviews found"}
                        </h3>
                        <p className="text-muted-foreground max-w-sm mt-1 mb-6">
                            {isImportingGoogleReviews
                                ? "Your first reviews usually appear within a minute. This page refreshes automatically."
                                : publicCount === 0
                                  ? "Connect your Google Business Profile to import and manage your reviews."
                                  : "Try adjusting your filters or sync your reviews."}
                        </p>
                        <SyncButton businessId={businessId} />
                    </div>
                )}
            </div>
        </>
    );
}
