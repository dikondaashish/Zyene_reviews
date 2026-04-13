
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/index";
import { motion } from "framer-motion";

export function AnalyticsFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentRange = searchParams.get("range") || "30d";

    const ranges = [
        { label: "7 Days", value: "7d" },
        { label: "30 Days", value: "30d" },
        { label: "90 Days", value: "90d" },
        { label: "12 Months", value: "12m" },
    ];

    const setRange = (range: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", range);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center p-1 bg-muted/40 backdrop-blur-sm rounded-lg border border-border/50">
            {ranges.map((range) => {
                const isActive = currentRange === range.value;
                return (
                    <button
                        key={range.value}
                        onClick={() => setRange(range.value)}
                        className={cn(
                            "relative px-4 py-1.5 text-xs font-bold transition-all rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                            isActive ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
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
