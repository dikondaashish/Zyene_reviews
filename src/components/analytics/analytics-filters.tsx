"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { dateRangeKeys, rangeToDays, type RangeKey } from "@/lib/query/date-range-keys";

async function prefetchAnalyticsRange(range: RangeKey) {
    const response = await fetch(`/api/v1/analytics?days=${rangeToDays(range)}`, {
        credentials: "include",
    });
    if (!response.ok) {
        throw new Error("Failed to prefetch analytics range");
    }
    return response.json();
}

async function prefetchAnalyticsFullRange(range: RangeKey, platform: string) {
    const response = await fetch(`/api/analytics/range-data?range=${range}&platform=${platform}`, {
        credentials: "include",
    });
    if (!response.ok) {
        throw new Error("Failed to prefetch full analytics range");
    }
    return response.json();
}

export function AnalyticsFilters({
    businessId,
    range: controlledRange,
    platform: controlledPlatform,
    onRangeChange,
}: {
    businessId: string;
    /** When set with `onRangeChange`, range UI is fully client-controlled (no router navigation). */
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

    const ranges: Array<{ label: string; value: RangeKey }> = [
        { label: "7 Days", value: "7d" },
        { label: "30 Days", value: "30d" },
        { label: "90 Days", value: "90d" },
        { label: "12 Months", value: "12m" },
    ];

    useEffect(() => {
        if (!isControlled) {
            setOptimisticRange(urlRange);
        }
    }, [urlRange, isControlled]);

    useEffect(() => {
        for (const rangeOption of ranges) {
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

    return (
        <div className="flex items-center p-1 bg-muted/40 backdrop-blur-sm rounded-lg border border-border/50">
            {ranges.map((range) => {
                const isActive = displayRange === range.value;
                return (
                    <button
                        key={range.value}
                        type="button"
                        onClick={() => setRange(range.value)}
                        className={cn(
                            "relative px-4 py-1.5 text-xs font-bold transition-all rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            isActive
                                ? "text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="active-range"
                                className="absolute inset-0 bg-primary rounded-[6px]"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{range.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
