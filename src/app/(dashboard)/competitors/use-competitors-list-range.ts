"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { CompetitorRangeKey } from "@/lib/competitors/date-range";
import { dateRangeKeys, type RangeKey } from "@/lib/query/date-range-keys";
import { COMPETITORS_LIST_RANGE_OPTIONS } from "./competitors-list-range-options";
import { prefetchCompetitorsRange } from "./competitors-list-prefetch";

export function useCompetitorsListRange(businessId: string, range: CompetitorRangeKey) {
    const [optimisticRange, setOptimisticRange] = useState<CompetitorRangeKey>(range);
    const rangeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();

    useEffect(() => {
        setOptimisticRange(range);
    }, [range]);

    useEffect(() => {
        return () => {
            if (rangeDebounceRef.current) {
                clearTimeout(rangeDebounceRef.current);
            }
        };
    }, []);

    useEffect(() => {
        for (const option of COMPETITORS_LIST_RANGE_OPTIONS) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("range", option.value);
            router.prefetch(`?${params.toString()}`);
            void queryClient.prefetchQuery({
                queryKey: dateRangeKeys.competitors(businessId, option.value as RangeKey),
                queryFn: () => prefetchCompetitorsRange(option.value),
                staleTime: 60_000,
            });
        }
    }, [router, searchParams, queryClient, businessId]);

    const setRange = (nextRange: CompetitorRangeKey) => {
        setOptimisticRange(nextRange);
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", nextRange);
        void queryClient.prefetchQuery({
            queryKey: dateRangeKeys.competitors(businessId, nextRange as RangeKey),
            queryFn: () => prefetchCompetitorsRange(nextRange),
            staleTime: 60_000,
        });
        if (rangeDebounceRef.current) clearTimeout(rangeDebounceRef.current);
        rangeDebounceRef.current = setTimeout(() => {
            router.push(`?${params.toString()}`, { scroll: false });
        }, 120);
    };

    const rangeLabel =
        COMPETITORS_LIST_RANGE_OPTIONS.find((r) => r.value === optimisticRange)?.label || "30 Days";

    return {
        optimisticRange,
        setRange,
        rangeLabel,
        rangeOptions: COMPETITORS_LIST_RANGE_OPTIONS,
    };
}
