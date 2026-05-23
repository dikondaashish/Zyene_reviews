"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Review } from "@/components/reviews/review-card-types";

export function useReviewCardListMutations(
    review: Review,
    onRefresh?: () => void,
    onDeleteReplySuccess?: () => void
) {
    const router = useRouter();
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isDeletingReply, setIsDeletingReply] = useState(false);

    const handleUpdateStatus = useCallback(
        async (status: "pending" | "ignored") => {
            setIsUpdatingStatus(true);
            try {
                const res = await fetch(`/api/reviews/${review.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ status }),
                });
                if (!res.ok) throw new Error("Failed to update status");
                toast.success(`Review ${status === "ignored" ? "ignored" : "moved to pending"}`);
                if (onRefresh) onRefresh();
                else router.refresh();
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : "An unexpected error occurred";
                toast.error(message);
            } finally {
                setIsUpdatingStatus(false);
            }
        },
        [review.id, onRefresh, router]
    );

    const handleDeleteReply = useCallback(async () => {
        setIsDeletingReply(true);
        try {
            const res = await fetch(`/api/reviews/${review.id}/reply`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to delete reply");
            toast.success("Reply removed");
            onDeleteReplySuccess?.();
            if (onRefresh) onRefresh();
            else router.refresh();
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "An unexpected error occurred";
            toast.error(message);
        } finally {
            setIsDeletingReply(false);
        }
    }, [review.id, onRefresh, router, onDeleteReplySuccess]);

    return { isUpdatingStatus, isDeletingReply, handleUpdateStatus, handleDeleteReply };
}
