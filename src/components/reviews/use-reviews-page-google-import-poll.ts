"use client";

import { useEffect } from "react";

export function useReviewsPageGoogleImportPoll(params: {
    isGoogleConnected: boolean;
    type: string;
    isImportingGoogleReviews: boolean;
    fetchReviews: (p: { type: string; status: string; rating: string; sort: string; page: number }) => void;
    filters: { status: string; rating: string; sort: string };
    page: number;
}) {
    const { isGoogleConnected, type, isImportingGoogleReviews, fetchReviews, filters, page } = params;

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
}
