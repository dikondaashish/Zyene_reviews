"use client";

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ReviewManagementItem } from "@/types/components";
import type { PrivateFeedback } from "./private-feedback-card";

type ReviewsList = ReviewManagementItem[] | PrivateFeedback[];

export function useReviewsPageHydrateFromServerProps(params: {
    initialReviews: ReviewsList;
    initialCount: number;
    initialTotalPages: number;
    initialPage: number;
    initialPublicCount: number;
    initialPrivateCount: number;
    initialType: string;
    initialFilters: { status: string; rating: string; sort: string };
    setReviews: Dispatch<SetStateAction<ReviewsList>>;
    setCount: Dispatch<SetStateAction<number>>;
    setTotalPages: Dispatch<SetStateAction<number>>;
    setPage: Dispatch<SetStateAction<number>>;
    setPublicCount: Dispatch<SetStateAction<number>>;
    setPrivateCount: Dispatch<SetStateAction<number>>;
    setType: Dispatch<SetStateAction<string>>;
    setFilters: Dispatch<SetStateAction<{ status: string; rating: string; sort: string }>>;
}) {
    const {
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
    } = params;

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
        setReviews,
        setCount,
        setTotalPages,
        setPage,
        setPublicCount,
        setPrivateCount,
        setType,
        setFilters,
    ]);
}
