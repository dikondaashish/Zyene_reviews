"use client";

import { ReviewSearch } from "@/components/reviews/review-search";
import { ReviewsFilters } from "@/components/reviews/reviews-filters";
import { ReviewManagement } from "@/components/reviews/review-management";
import { Button } from "@/components/ui/button";
import { MessageSquare, SearchX } from "lucide-react";
import { SyncButton } from "@/components/dashboard/sync-button";
import { PanelLoading } from "@/components/dashboard/panel-loading";
import type { ReviewManagementItem } from "@/types/components";

interface ReviewsPageClientPublicPanelProps {
    businessId: string;
    googleMapsListingUrl?: string | null;
    planAllowsAiReplies: boolean;
    filters: { status: string; rating: string; sort: string; q?: string };
    loading: boolean;
    reviews: ReviewManagementItem[];
    isImportingGoogleReviews: boolean;
    publicCount: number;
    resultCount: number;
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
    resultCount,
    onFilterChange,
    onRefresh,
}: ReviewsPageClientPublicPanelProps) {
    return (
        <section aria-label="Public reviews inbox" className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
            <div className="space-y-3 border-b border-border p-4">
            <ReviewSearch key={filters.q || ""} query={filters.q || ""} onSearch={(q) => onFilterChange("q", q)} />
            <ReviewsFilters filters={filters} onFilterChange={onFilterChange} />
            </div>
            {loading && reviews.length === 0 ? <PanelLoading label="reviews" className="h-[360px]" /> : <div aria-busy={loading} inert={loading} className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
                {reviews && reviews.length > 0 ? (
                    <ReviewManagement
                        reviews={reviews}
                        resultCount={resultCount}
                        loading={loading}
                        businessId={businessId}
                        googleMapsListingUrl={googleMapsListingUrl}
                        planAllowsAiReplies={planAllowsAiReplies}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                        <div className="bg-muted rounded-full flex items-center justify-center mb-4 size-12">
                            {publicCount > 0 ? <SearchX className="size-6 text-muted-foreground" /> : <MessageSquare className="size-6 text-muted-foreground" />}
                        </div>
                        <h2 className="text-lg font-medium text-foreground">
                            {isImportingGoogleReviews
                                ? "Importing your Google reviews"
                                : publicCount === 0
                                  ? "No reviews synced yet"
                                  : filters.status === "needs_response" && filters.rating === "all" && !filters.q ? "You’re all caught up" : "No matching reviews"}
                        </h2>
                        <p className="text-muted-foreground max-w-sm mt-1 mb-6">
                            {isImportingGoogleReviews
                                ? "Your first reviews usually appear within a minute. This page refreshes automatically."
                                : publicCount === 0
                                  ? "Connect your Google Business Profile to import and manage your reviews."
                                  : filters.status === "needs_response" && filters.rating === "all" && !filters.q ? "There are no reviews waiting for a reply. View all reviews to revisit your conversations." : "Try a different name, keyword, or rating to find the review you need."}
                        </p>
                        {publicCount === 0 ? <SyncButton businessId={businessId} /> : <div className="flex flex-wrap justify-center gap-2">
                            {filters.q && <Button variant="outline" onClick={() => onFilterChange("q", "")}>Clear search</Button>}
                            {filters.rating !== "all" && <Button variant="outline" onClick={() => onFilterChange("rating", "all")}>Show all ratings</Button>}
                            {filters.status !== "all" && <Button variant="outline" onClick={() => onFilterChange("status", "all")}>View all reviews</Button>}
                        </div>}
                    </div>
                )}
            </div>}
        </section>
    );
}
