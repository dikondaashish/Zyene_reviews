"use client";

import { toast } from "sonner";
import { useState, useCallback, useRef } from "react";
import { useGoogleSyncRemoteState } from "@/hooks/use-google-sync-remote-state";
import { fetchReviewsPageData, updateReviewsPageUrl } from "@/components/reviews/reviews-page-client-fetch";
import type { ReviewsPageClientProps } from "./reviews-page-client-types";
import { useReviewsPageHydrateFromServerProps } from "./use-reviews-page-hydrate-from-server-props";
import { useReviewsPageGoogleImportPoll } from "./use-reviews-page-google-import-poll";
import { useReviewsPageListHandlers } from "./use-reviews-page-list-handlers";

export function useReviewsPageClientList(props: ReviewsPageClientProps) {
    const {
        businessId,
        isGoogleConnected,
        initialGoogleSyncStatus,
        initialGoogleLastSyncedAt,
        initialReviews,
        initialCount,
        initialTotalPages,
        initialPage,
        initialPublicCount,
        initialPrivateCount,
        initialType,
        initialFilters,
    } = props;

    const requestVersion = useRef(0);
    const currentBusinessId = useRef(businessId);
    currentBusinessId.current = businessId;
    const [reviews, setReviews] = useState(initialReviews);
    const [count, setCount] = useState(initialCount);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [page, setPage] = useState(initialPage);
    const [publicCount, setPublicCount] = useState(initialPublicCount);
    const [privateCount, setPrivateCount] = useState(initialPrivateCount);
    const [type, setType] = useState(initialType);
    const [filters, setFilters] = useState(initialFilters);
    const [isFetching, setIsFetching] = useState(false);

    const { remoteStatus, lastSyncedAt, isSyncBusy } = useGoogleSyncRemoteState({
        businessId,
        initialSyncStatus: initialGoogleSyncStatus,
        initialLastSyncedAt: initialGoogleLastSyncedAt,
    });

    const isImportingGoogleReviews =
        isGoogleConnected &&
        (remoteStatus === "running" || isSyncBusy || (publicCount === 0 && !lastSyncedAt));

    useReviewsPageHydrateFromServerProps({
        initialReviews,
        initialCount,
        initialTotalPages,
        initialPage,
        initialPublicCount,
        initialPrivateCount,
        initialType,
        initialFilters,
        setReviews,
        setCount,
        setTotalPages,
        setPage,
        setPublicCount,
        setPrivateCount,
        setType,
        setFilters,
    });

    const fetchReviews = useCallback(
        async (params: { type: string; status: string; rating: string; sort: string; q?: string; page: number }) => {
            const version = ++requestVersion.current;
            const requestedBusinessId = currentBusinessId.current;
            setIsFetching(true);
            try {
                const data = await fetchReviewsPageData(params);
                if (version !== requestVersion.current || requestedBusinessId !== currentBusinessId.current) return;
                updateReviewsPageUrl(params);
                setReviews(data.reviews);
                setCount(data.count);
                setTotalPages(data.totalPages);
                setPage(data.page);
                setPublicCount(data.publicCount);
                setPrivateCount(data.privateCount);
            } catch {
                if (version === requestVersion.current) toast.error("Could not update reviews. Previous results are still shown; try again.");
            } finally {
                if (version === requestVersion.current) setIsFetching(false);
            }
        },
        [],
    );

    useReviewsPageGoogleImportPoll({
        isGoogleConnected,
        type,
        isImportingGoogleReviews,
        fetchReviews,
        filters,
        page,
    });

    const h = useReviewsPageListHandlers(type, filters, page, fetchReviews, setFilters, setPage, setType);
    const loading = h.isPending || isFetching;

    return {
        reviews,
        count,
        totalPages,
        page,
        publicCount,
        privateCount,
        type,
        filters,
        loading,
        isImportingGoogleReviews,
        handleFilterChange: h.handleFilterChange,
        handleTypeChange: h.handleTypeChange,
        handlePageChange: h.handlePageChange,
        refresh: h.refresh,
    };
}
