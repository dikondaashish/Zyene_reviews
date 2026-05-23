"use client";

import { format, parseISO } from "date-fns";
import { Clock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimelineRequestItem } from "@/lib/customers/customer-detail-data";
import { humanizeRequestStatus } from "@/lib/customers/customer-detail-data";
import { channelLabel, requestStatusTone } from "@/components/customers/customer-detail-helpers";

export function CustomerDetailTimelineRequestItem({ item }: { item: TimelineRequestItem }) {
    const tone = requestStatusTone(item.status);
    return (
        <div className="flex gap-4">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary shadow-inner">
                <MessageSquare className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2 gap-y-1">
                    <p className="font-medium text-foreground">{channelLabel(item.channel)} review request</p>
                    <span
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            tone.className
                        )}
                    >
                        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", tone.dot)} />
                        {humanizeRequestStatus(item.status)}
                    </span>
                </div>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        {item.sent_at
                            ? format(parseISO(item.sent_at), "MMM d, yyyy · h:mm a")
                            : format(parseISO(item.sortAt), "MMM d, yyyy · h:mm a")}
                    </span>
                    {item.review_left ? (
                        <>
                            <span className="hidden sm:inline" aria-hidden>
                                ·
                            </span>
                            <span className="text-chart-2">Review completed</span>
                        </>
                    ) : null}
                </p>
            </div>
        </div>
    );
}
