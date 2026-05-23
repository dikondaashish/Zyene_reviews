"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { dateRangeKeys, type RangeKey } from "@/lib/query/date-range-keys";
import {
    ANALYTICS_FILTER_RANGES,
    prefetchAnalyticsFullRange,
    prefetchAnalyticsRange,
} from "./analytics-filters-prefetch";

export function useAnalyticsFilters({
    businessId,
    range: controlledRange,
    platform: controlledPlatform,
    onRangeChange,
}: {
    businessId: string;
    range?: RangeKey;
    platform?: string;
    onRangeChange?: (r: RangeKey) => void;
}) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const urlRange = (searchParams.get("range") || "30d") as RangeKey;
    const urlPlatform = searchParams.get("platform") || "all";
    const isControlled = Boolean(onRangeChange && controlledRange !== undefined);
    const effectivePlatform = controlledPlatform ?? urlPlatform;
    const [optimisticRange, setOptimisticRange] = useState<RangeKey>(urlRange);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const displayRange = isControlled ? (controlledRange as RangeKey) : optimisticRange;

    useEffect(() => {
        if (!isControlled) {
            setOptimisticRange(urlRange);
        }
    }, [urlRange, isControlled]);

    useEffect(() => {
        for (const rangeOption of ANALYTICS_FILTER_RANGES) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("range", rangeOption.value);
            router.prefetch(`?${params.toString()}`);
            void queryClient.prefetchQuery({
                queryKey: dateRangeKeys.analytics(businessId, rangeOption.value),
                queryFn: () => prefetchAnalyticsRange(rangeOption.value),
                staleTime: 60_000,
            });
            void queryClient.prefetchQuery({
                queryKey: ["analytics-full", businessId, rangeOption.value, effectivePlatform] as const,
                queryFn: () => prefetchAnalyticsFullRange(rangeOption.value, effectivePlatform),
                staleTime: 60_000,
            });
        }
    }, [router, searchParams, queryClient, businessId, effectivePlatform]);

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const setRange = (range: RangeKey) => {
        if (isControlled && onRangeChange) {
            onRangeChange(range);
            void queryClient.prefetchQuery({
                queryKey: dateRangeKeys.analytics(businessId, range),
                queryFn: () => prefetchAnalyticsRange(range),
                staleTime: 60_000,
            });
            void queryClient.prefetchQuery({
                queryKey: ["analytics-full", businessId, range, effectivePlatform] as const,
                queryFn: () => prefetchAnalyticsFullRange(range, effectivePlatform),
                staleTime: 60_000,
            });
            return;
        }

        setOptimisticRange(range);
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", range);
        void queryClient.prefetchQuery({
            queryKey: dateRangeKeys.analytics(businessId, range),
            queryFn: () => prefetchAnalyticsRange(range),
            staleTime: 60_000,
        });
        void queryClient.prefetchQuery({
            queryKey: ["analytics-full", businessId, range, effectivePlatform] as const,
            queryFn: () => prefetchAnalyticsFullRange(range, effectivePlatform),
            staleTime: 60_000,
        });
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            router.push(`?${params.toString()}`, { scroll: false });
        }, 120);
    };

    return { displayRange, setRange, ranges: ANALYTICS_FILTER_RANGES };
}
