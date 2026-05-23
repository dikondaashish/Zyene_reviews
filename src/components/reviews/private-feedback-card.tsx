"use client";

import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrivateFeedbackCardBody } from "./private-feedback-card-body";
import { PrivateFeedbackCardHeader } from "./private-feedback-card-header";
import type { PrivateFeedback } from "./private-feedback-card-types";
import { usePrivateFeedbackCard } from "./use-private-feedback-card";

export type { PrivateFeedback } from "./private-feedback-card-types";

export function PrivateFeedbackCard({ feedback }: { feedback: PrivateFeedback }) {
    const { status, isUpdating, handleStatusUpdate } = usePrivateFeedbackCard(feedback.id, feedback.status);

    return (
        <div
            className={cn(
                "group relative min-w-0 overflow-hidden space-y-4 rounded-lg border border-border border-l-4 bg-card p-4 transition-all duration-300 sm:p-5",
                "hover:-translate-y-0.5 hover:shadow-lg hover:border-canvas-elevated/60",
                status === "open"
                    ? "border-l-red-500"
                    : status === "contacted"
                      ? "border-l-primary"
                      : "border-l-primary opacity-90",
            )}
        >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-canvas-elevated/35 via-canvas-elevated/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <PrivateFeedbackCardHeader
                feedback={feedback}
                status={status}
                isUpdating={isUpdating}
                onStatusUpdate={handleStatusUpdate}
            />
            <PrivateFeedbackCardBody feedback={feedback} />

            {status === "resolved" && (
                <div className="relative z-10 pt-1 flex items-center gap-1 text-[10px] font-medium text-chart-2">
                    <CheckCircle className="size-3" />
                    Conversation marked as recovered
                </div>
            )}
        </div>
    );
}
