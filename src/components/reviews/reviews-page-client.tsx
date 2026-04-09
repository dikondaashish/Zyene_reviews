"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import { ReviewsFilters } from "./reviews-filters";
import { ReviewManagement } from "./review-management";
import { PrivateFeedbackCard } from "./private-feedback-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { MessageSquare, Lock, Download, Loader2 } from "lucide-react";
import { SyncButton } from "@/components/dashboard/sync-button";
import { toast } from "sonner";

interface ReviewsPageClientProps {
    businessId: string;
    initialReviews: any[];
    initialCount: number;
    initialTotalPages: number;
    initialPage: number;
    initialPublicCount: number;
    initialPrivateCount: number;
    initialType: string;
    initialFilters: {
        status: string;
        rating: string;
        sort: string;
    };
}

export function ReviewsPageClient({
    businessId,
    initialReviews,
    initialCount,
    initialTotalPages,
    initialPage,
    initialPublicCount,
    initialPrivateCount,
    initialType,
    initialFilters,
}: ReviewsPageClientProps) {
    const [reviews, setReviews] = useState(initialReviews);
    const [count, setCount] = useState(initialCount);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [page, setPage] = useState(initialPage);
    const [publicCount, setPublicCount] = useState(initialPublicCount);
    const [privateCount, setPrivateCount] = useState(initialPrivateCount);
    const [type, setType] = useState(initialType);
    const [filters, setFilters] = useState(initialFilters);
    const [isPending, startTransition] = useTransition();
    const [isFetching, setIsFetching] = useState(false);
    const [isBackfillingAi, setIsBackfillingAi] = useState(false);

    const loading = isPending || isFetching;

    const fetchReviews = useCallback(async (params: {
        type: string;
        status: string;
        rating: string;
        sort: string;
        page: number;
    }) => {
        setIsFetching(true);
        try {
            const searchParams = new URLSearchParams();
            searchParams.set("type", params.type);
            if (params.status !== "all") searchParams.set("status", params.status);
            if (params.rating !== "all") searchParams.set("rating", params.rating);
            if (params.sort !== "newest") searchParams.set("sort", params.sort);
            searchParams.set("page", params.page.toString());

            const res = await fetch(`/api/reviews?${searchParams.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch reviews");
            const data = await res.json();

            setReviews(data.reviews);
            setCount(data.count);
            setTotalPages(data.totalPages);
            setPage(data.page);
            setPublicCount(data.publicCount);
            setPrivateCount(data.privateCount);

            // Update URL without navigation
            const url = new URL(window.location.href);
            url.searchParams.set("type", params.type);
            if (params.status !== "all") url.searchParams.set("status", params.status);
            else url.searchParams.delete("status");
            if (params.rating !== "all") url.searchParams.set("rating", params.rating);
            else url.searchParams.delete("rating");
            if (params.sort !== "newest") url.searchParams.set("sort", params.sort);
            else url.searchParams.delete("sort");
            url.searchParams.set("page", params.page.toString());
            window.history.replaceState(null, "", url.toString());
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
        } finally {
            setIsFetching(false);
        }
    }, []);

    const handleFilterChange = useCallback((key: string, value: string) => {
        startTransition(() => {
            const newFilters = { ...filters, [key]: value };
            if (key !== "page") {
                setFilters(newFilters);
                setPage(1);
                fetchReviews({ type, ...newFilters, page: 1 });
            }
        });
    }, [filters, type, fetchReviews]);

    const handleTypeChange = useCallback((newType: string) => {
        startTransition(() => {
            setType(newType);
            setPage(1);
            setFilters({ status: "all", rating: "all", sort: "newest" });
            fetchReviews({ type: newType, status: "all", rating: "all", sort: "newest", page: 1 });
        });
    }, [fetchReviews]);

    const handlePageChange = useCallback((newPage: number) => {
        startTransition(() => {
            setPage(newPage);
            fetchReviews({ type, ...filters, page: newPage });
        });
    }, [type, filters, fetchReviews]);

    // Refetch when data changes (e.g., after reply/status update)
    const refresh = useCallback(() => {
        fetchReviews({ type, ...filters, page });
    }, [type, filters, page, fetchReviews]);

    const handleBackfillAi = useCallback(async () => {
        setIsBackfillingAi(true);
        try {
            const response = await fetch("/api/smart/analyze/backfill", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ limit: 1500, businessId }),
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error || "Failed to queue AI analysis");
            }
            const queued = payload?.data?.queued ?? payload?.queued ?? 0;
            if (queued > 0) {
                toast.success(`Queued AI analysis for ${queued} reviews.`);
            } else {
                toast.info("No pending reviews need AI analysis.");
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to queue AI analysis";
            toast.error(message);
        } finally {
            setIsBackfillingAi(false);
        }
    }, [businessId]);

    return (
        <>
            {/* Tab Switcher */}
            <div className="flex items-center gap-3">
                <div className="bg-muted p-1 rounded-lg inline-flex">
                    <button onClick={() => handleTypeChange("public")}>
                        <div className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${type === "public" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                            Public Reviews ({publicCount})
                        </div>
                    </button>
                    <button onClick={() => handleTypeChange("private")}>
                        <div className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${type === "private" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                            Private Feedback ({privateCount})
                            <Lock className="w-3 h-3" />
                        </div>
                    </button>
                </div>
                {loading && (
                    <Loader2 className="w-4 h-4 ml-3 animate-spin text-muted-foreground" />
                )}
                {type === "public" && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBackfillAi}
                        disabled={isBackfillingAi}
                    >
                        {isBackfillingAi ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Queuing AI...
                            </>
                        ) : (
                            "Analyze Missing AI"
                        )}
                    </Button>
                )}
            </div>

            {/* Content */}
            {type === "public" ? (
                <>
                    <ReviewsFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                    <div className={loading ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}>
                        {reviews && reviews.length > 0 ? (
                            <ReviewManagement reviews={reviews} businessId={businessId} onRefresh={refresh} />
                        ) : (
                            <div className="text-center py-20 flex flex-col items-center justify-center border rounded-lg bg-muted/30 border-dashed">
                                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">
                                    {publicCount === 0 ? "No reviews synced yet" : "No reviews found"}
                                </h3>
                                <p className="text-muted-foreground max-w-sm mt-1 mb-6">
                                    {publicCount === 0
                                        ? "Connect your Google Business Profile to import and manage your reviews."
                                        : "Try adjusting your filters or sync your reviews."}
                                </p>
                                <SyncButton />
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className={`grid gap-4 ${loading ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}`}>
                    {reviews && reviews.length > 0 ? (
                        reviews.map((feedback: any) => (
                            <PrivateFeedbackCard key={feedback.id} feedback={feedback} />
                        ))
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
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4 pb-8">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1 || loading}
                        onClick={() => handlePageChange(page - 1)}
                    >
                        Previous
                    </Button>
                    <div className="text-sm flex items-center text-muted-foreground">
                        Page {page} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages || loading}
                        onClick={() => handlePageChange(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </>
    );
}
