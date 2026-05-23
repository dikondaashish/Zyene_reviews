"use client";

import { useState } from "react";
import { toast } from "sonner";

export function usePrivateFeedbackCard(feedbackId: string, initialStatus?: string | null) {
    const [status, setStatus] = useState(initialStatus || "open");
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusUpdate = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/reviews/private/${feedbackId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error("Failed to update");
            setStatus(newStatus);
            toast.success(`Status updated to ${newStatus}`);
        } catch {
            toast.error("Failed to update status");
        } finally {
            setIsUpdating(false);
        }
    };

    return { status, isUpdating, handleStatusUpdate };
}
