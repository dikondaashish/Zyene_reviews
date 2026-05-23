"use client";

import { useState, useCallback } from "react";
import { useGoogleSyncRemoteState } from "@/hooks/use-google-sync-remote-state";
import { fetchReviewsPageData } from "./reviews-page-client-fetch";
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
        async (params: { type: string; status: string; rating: string; sort: string; page: number }) => {
            setIsFetching(true);
            try {
                const data = await fetchReviewsPageData(params);
                setReviews(data.reviews);
                setCount(data.count);
                setTotalPages(data.totalPages);
                setPage(data.page);
                setPublicCount(data.publicCount);
                setPrivateCount(data.privateCount);
            } catch {
                /* keep UI stable */
            } finally {
                setIsFetching(false);
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
