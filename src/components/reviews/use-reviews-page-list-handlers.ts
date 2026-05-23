"use client";

import { useCallback, useTransition } from "react";

export function useReviewsPageListHandlers(
    type: string,
    filters: { status: string; rating: string; sort: string },
    page: number,
    fetchReviews: (p: { type: string; status: string; rating: string; sort: string; page: number }) => void,
    setFilters: (v: { status: string; rating: string; sort: string }) => void,
    setPage: (v: number) => void,
    setType: (v: string) => void,
) {
    const [isPending, startTransition] = useTransition();

    const handleFilterChange = useCallback(
        (key: string, value: string) => {
            startTransition(() => {
                const newFilters = { ...filters, [key]: value };
                if (key !== "page") {
                    setFilters(newFilters);
                    setPage(1);
                    fetchReviews({ type, ...newFilters, page: 1 });
                }
            });
        },
        [filters, type, fetchReviews, setFilters, setPage],
    );

    const handleTypeChange = useCallback(
        (newType: string) => {
            startTransition(() => {
                setType(newType);
                setPage(1);
                setFilters({ status: "all", rating: "all", sort: "newest" });
                fetchReviews({ type: newType, status: "all", rating: "all", sort: "newest", page: 1 });
            });
        },
        [fetchReviews, setType, setPage, setFilters],
    );

    const handlePageChange = useCallback(
        (newPage: number) => {
            startTransition(() => {
                setPage(newPage);
                fetchReviews({ type, ...filters, page: newPage });
            });
        },
        [type, filters, fetchReviews, setPage],
    );

    const refresh = useCallback(() => {
        fetchReviews({ type, ...filters, page });
    }, [type, filters, page, fetchReviews]);

    return { isPending, handleFilterChange, handleTypeChange, handlePageChange, refresh };
}
