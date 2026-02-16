
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        const params = new URLSearchParams(searchParams);
        params.set("range", range);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            {ranges.map((range) => (
                <Button
                    key={range.value}
                    variant={currentRange === range.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRange(range.value)}
                    className={cn(
                        "transition-all",
                        currentRange === range.value ? "font-semibold" : "text-muted-foreground"
                    )}
                >
                    {range.label}
                </Button>
            ))}
        </div>
    );
}
