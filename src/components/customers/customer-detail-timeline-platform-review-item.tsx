"use client";

import { format, parseISO } from "date-fns";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimelinePlatformReviewItem } from "@/lib/customers/customer-detail-data";
import { platformLabel } from "@/components/customers/customer-detail-helpers";

export function CustomerDetailTimelinePlatformReviewItem({ item }: { item: TimelinePlatformReviewItem }) {
    return (
        <div className="flex gap-4">
            <div className="mt-0.5 flex shrink-0 items-center justify-center rounded-xl bg-chart-2/15 text-chart-2 shadow-inner size-11">
                <Star className="size-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
                <p className="font-medium text-foreground">Public review · {platformLabel(item.platform)}</p>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={cn(
                                    "size-4",
                                    i < item.rating ? "fill-chart-2 text-chart-2" : "text-muted-foreground/25"
                                )}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {format(parseISO(item.sortAt), "MMM d, yyyy · h:mm a")}
                    </span>
                </div>
                {item.text ? (
                    <p className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm leading-relaxed text-muted-foreground">
                        {item.text}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
