"use client";

import { format, parseISO } from "date-fns";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimelineFeedbackItem } from "@/lib/customers/customer-detail-data";

export function CustomerDetailTimelineFeedbackItem({ item }: { item: TimelineFeedbackItem }) {
    return (
        <div className="flex gap-4">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-chart-4/15 text-chart-4 shadow-inner">
                <Star className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
                <p className="font-medium text-foreground">Private feedback</p>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={cn(
                                    "h-4 w-4",
                                    i < item.rating ? "fill-chart-4 text-chart-4" : "text-muted-foreground/25"
                                )}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {format(parseISO(item.sortAt), "MMM d, yyyy · h:mm a")}
                    </span>
                </div>
                {item.content ? (
                    <p className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm leading-relaxed text-muted-foreground">
                        {item.content}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
