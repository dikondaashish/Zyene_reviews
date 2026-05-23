"use client";

import { CheckCircle2, Clock, MessageSquare, User } from "lucide-react";

import { TimeAgo } from "@/components/ui/time-ago";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PrivateFeedback } from "./private-feedback-card-types";
import { PrivateFeedbackCardStars } from "./private-feedback-card-stars";

export function PrivateFeedbackCardHeader({
    feedback,
    status,
    isUpdating,
    onStatusUpdate,
}: {
    feedback: PrivateFeedback;
    status: string;
    isUpdating: boolean;
    onStatusUpdate: (status: string) => void;
}) {
    const customerName = feedback.review_requests?.customer_name || "Anonymous Customer";

    return (
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3">
                <div
                    className={cn(
                        "rounded-full flex items-center justify-center font-bold text-sm border size-10",
                        status === "open"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : status === "contacted"
                              ? "bg-chart-4/12 text-chart-4 border-chart-4/30"
                              : "bg-chart-2/10 text-chart-2 border-chart-2/20",
                    )}
                >
                    <User className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="break-words text-sm font-semibold text-foreground">{customerName}</div>
                        {feedback.category && (
                            <Badge
                                variant="secondary"
                                className="px-1.5 py-0 h-4 text-[9px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border-none"
                            >
                                {feedback.category}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <PrivateFeedbackCardStars rating={feedback.rating} />
                        <TimeAgo date={feedback.created_at} className="text-xs text-muted-foreground" />
                    </div>
                </div>
            </div>

            <div className="flex w-full items-center sm:w-auto sm:shrink-0">
                <Select value={status} onValueChange={onStatusUpdate} disabled={isUpdating}>
                    <SelectTrigger
                        className={cn(
                            "h-8 w-full min-w-[120px] text-[10px] font-bold uppercase tracking-wider border-none ring-0 focus:ring-0 sm:w-[110px]",
                            status === "open"
                                ? "bg-destructive/10 text-destructive"
                                : status === "contacted"
                                  ? "bg-chart-4/12 text-chart-4"
                                  : "bg-chart-2/10 text-chart-2",
                        )}
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="open">
                            <span className="flex items-center gap-1.5">
                                <Clock className="size-3" /> Open
                            </span>
                        </SelectItem>
                        <SelectItem value="contacted">
                            <span className="flex items-center gap-1.5">
                                <MessageSquare className="size-3" /> Contacted
                            </span>
                        </SelectItem>
                        <SelectItem value="resolved">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="size-3" /> Resolved
                            </span>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
