"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import { ReviewsFilters } from "./reviews-filters";
import { ReviewManagement } from "./review-management";
import { PrivateFeedbackCard } from "./private-feedback-card";
import { AutoReplyToolbar, type AutoReplySettingsState } from "./auto-reply-toolbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Lock, Download, Loader2, Eye } from "lucide-react";
import { SyncButton } from "@/components/dashboard/sync-button";
import { toast } from "sonner";
import { UpgradeModal } from "@/components/settings/upgrade-modal";
import { useGoogleSyncRemoteState } from "@/hooks/use-google-sync-remote-state";
import type { ReviewManagementItem } from "@/types/components";
import type { PrivateFeedback } from "./private-feedback-card";

interface ReviewsPageClientProps {
    businessId: string;
    /** Opens the connected GBP listing on Google Maps (for review photos Google does not API). */
    googleMapsListingUrl?: string | null;
    isDemo: boolean;
    isGoogleConnected: boolean;
    initialGoogleSyncStatus?: string | null;
    initialGoogleLastSyncedAt?: string | null;
    /** Starter, Professional, or Enterprise — required to enable Auto commenter */
    autoCommenterPlanOk: boolean;
    autoReplyInitial: AutoReplySettingsState;
    initialReviews: ReviewManagementItem[] | PrivateFeedback[];
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
    googleMapsListingUrl = null,
    isDemo,
    isGoogleConnected,
    initialGoogleSyncStatus = null,
    initialGoogleLastSyncedAt = null,
    autoCommenterPlanOk,
    autoReplyInitial,
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
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const loading = isPending || isFetching;

    const { remoteStatus, lastSyncedAt, isSyncBusy } = useGoogleSyncRemoteState({
        businessId,
        initialSyncStatus: initialGoogleSyncStatus,
        initialLastSyncedAt: initialGoogleLastSyncedAt,
    });

    const isImportingGoogleReviews =
        isGoogleConnected &&
        (remoteStatus === "running" || isSyncBusy || (publicCount === 0 && !lastSyncedAt));

    useEffect(() => {
        setReviews(initialReviews);
        setCount(initialCount);
        setTotalPages(initialTotalPages);
        setPage(initialPage);
        setPublicCount(initialPublicCount);
        setPrivateCount(initialPrivateCount);
        setType(initialType);
        setFilters(initialFilters);
    }, [
        initialReviews,
        initialCount,
        initialTotalPages,
        initialPage,
        initialPublicCount,
        initialPrivateCount,
        initialType,
        initialFilters.status,
        initialFilters.rating,
        initialFilters.sort,
    ]);

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
        } finally {
            setIsFetching(false);
        }
    }, []);

    useEffect(() => {
        if (!isGoogleConnected || type !== "public" || !isImportingGoogleReviews) return;

        const poll = () => {
            void fetchReviews({ type, ...filters, page });
        };
        poll();
        const id = setInterval(poll, 3000);
        const stop = setTimeout(() => clearInterval(id), 120_000);
        return () => {
            clearInterval(id);
            clearTimeout(stop);
        };
    }, [isGoogleConnected, type, isImportingGoogleReviews, fetchReviews, filters, page]);

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
                if (payload?.code === "AI_ANALYSIS_PLAN_REQUIRED") {
                    setShowUpgradeModal(true);
                    return;
                }
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
        <div className="min-w-0">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight sm:gap-3 sm:text-2xl">
                        Reviews
                        <span className="rounded-full bg-muted px-2 py-0.5 text-sm font-normal text-muted-foreground">
                            {count || 0}
                        </span>
                        {isDemo && (
                            <Badge
                                variant="outline"
                                className="flex items-center gap-1 border-primary/30 bg-primary/10 px-2.5 py-0.5 font-normal tracking-tight text-primary"
                            >
                                <Eye className="h-3 w-3" />
                                Interactive Demo
                            </Badge>
                        )}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage and respond to your customer reviews.
                    </p>
                </div>
                <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:items-end">
                    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
                        <Button variant="outline" className="w-full sm:w-auto" asChild>
                            <a
                                href={`/api/reviews/export?type=${type}`}
                                className="flex w-full items-center justify-center"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                <span className="sm:hidden">Export</span>
                                <span className="hidden sm:inline">Export CSV</span>
                            </a>
                        </Button>
                        <div className="w-full sm:w-auto [&_button]:w-full sm:[&_button]:w-auto">
                            <SyncButton businessId={businessId} />
                        </div>
                    </div>
                    {isGoogleConnected && (
                        <AutoReplyToolbar
                            businessId={businessId}
                            googleConnected={isGoogleConnected}
                            planAllowsAutoCommenter={autoCommenterPlanOk}
                            initial={autoReplyInitial}
                        />
                    )}
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="inline-flex w-full min-w-0 rounded-lg bg-muted p-1 sm:w-auto">
                    <button type="button" className="min-w-0 flex-1" onClick={() => handleTypeChange("public")}>
                        <div className={`cursor-pointer rounded-md px-3 py-2 text-center text-xs font-medium transition-all sm:px-4 sm:py-1.5 sm:text-sm ${type === "public" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                            Public ({publicCount})
                        </div>
                    </button>
                    <button type="button" className="min-w-0 flex-1" onClick={() => handleTypeChange("private")}>
                        <div className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:py-1.5 sm:text-sm ${type === "private" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                            Private ({privateCount})
                            <Lock className="h-3 w-3 shrink-0" />
                        </div>
                    </button>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                {(loading || isImportingGoogleReviews) && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {isImportingGoogleReviews && (
                    <span className="text-xs text-muted-foreground">Importing from Google…</span>
                )}
                {type === "public" && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
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
                            <ReviewManagement
                                reviews={reviews as ReviewManagementItem[]}
                                businessId={businessId}
                                googleMapsListingUrl={googleMapsListingUrl}
                                planAllowsAiReplies={autoCommenterPlanOk}
                                onRefresh={refresh}
                            />
                        ) : (
                            <div className="text-center py-20 flex flex-col items-center justify-center border rounded-lg bg-muted/30 border-dashed">
                                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
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
            ) : (
                <div className={`grid gap-4 ${loading ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}`}>
                    {reviews && reviews.length > 0 ? (
                        (reviews as PrivateFeedback[]).map((feedback) => (
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
                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 pb-8 sm:flex sm:justify-center sm:gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-full sm:h-8 sm:w-auto"
                        disabled={page <= 1 || loading}
                        onClick={() => handlePageChange(page - 1)}
                    >
                        Previous
                    </Button>
                    <div className="text-center text-sm text-muted-foreground tabular-nums">
                        {page} / {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-full sm:h-8 sm:w-auto"
                        disabled={page >= totalPages || loading}
                        onClick={() => handlePageChange(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                context="ai_analysis"
            />
        </div>
    );
}
