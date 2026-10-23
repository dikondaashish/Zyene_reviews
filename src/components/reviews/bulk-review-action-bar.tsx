"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, X, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BulkReviewActionBarProps {
    selectedIds: string[];
    onClearSelection: () => void;
    businessId: string;
    onRefresh?: () => void;
}

export function BulkReviewActionBar({ selectedIds, onClearSelection, businessId, onRefresh }: BulkReviewActionBarProps) {
    const [updating, setUpdating] = useState<"ignored" | "pending" | null>(null);
    const isUpdating = updating !== null;
    const router = useRouter();

    const handleBulkStatusUpdate = async (status: 'ignored' | 'pending') => {
        setUpdating(status);
        try {
            const res = await fetch("/api/reviews/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ids: selectedIds,
                    businessId,
                    status
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error((data as { error?: string }).error || "Failed to update reviews");

            const payload = (data as { data?: { count?: number } }).data;
            const updatedCount = payload?.count ?? (data as { count?: number }).count ?? selectedIds.length;
            const noun = updatedCount === 1 ? "review" : "reviews";
            toast.success(status === "ignored" ? `${updatedCount} ${noun} marked as ignored` : `${updatedCount} ${noun} moved back to Needs reply`);
            onClearSelection();
            if (onRefresh) onRefresh();
            else router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(message);
        } finally {
            setUpdating(null);
        }
    };

    if (selectedIds.length === 0) return null;

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom-4 duration-300 sm:px-4">
            <div className="pointer-events-auto flex w-full max-w-lg flex-col gap-2 rounded-2xl border border-border bg-foreground px-3 py-2.5 text-background shadow-lg sm:max-w-none sm:flex-row sm:items-center sm:gap-3 sm:rounded-full sm:px-4">
                <div className="flex items-center justify-between gap-2 sm:justify-start sm:border-r sm:border-border/40 sm:pr-3">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground size-5">
                            {selectedIds.length}
                        </div>
                        <span className="text-xs font-medium">Selected</span>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onClearSelection}
                        className="shrink-0 rounded-full p-0 text-background/70 hover:bg-background/20 hover:text-background sm:hidden size-8"
                        aria-label="Clear selection"
                    >
                        <X className="size-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleBulkStatusUpdate('ignored')}
                        disabled={isUpdating}
                        className="h-9 w-full rounded-lg text-xs text-background/80 hover:bg-background/20 hover:text-background sm:h-8 sm:w-auto sm:rounded-full"
                    >
                        {updating === "ignored" ? <Loader2 className="mr-1.5 animate-spin size-3.5" /> : <EyeOff className="mr-1.5 size-3.5" />}
                        Mark as ignored
                    </Button>

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleBulkStatusUpdate('pending')}
                        disabled={isUpdating}
                        className="h-9 w-full rounded-lg text-xs text-background/80 hover:bg-background/20 hover:text-background sm:h-8 sm:w-auto sm:rounded-full"
                    >
                        {updating === "pending" ? <Loader2 className="mr-1.5 animate-spin size-3.5" /> : <MessageSquare className="mr-1.5 size-3.5" />}
                        Mark as needs reply
                    </Button>
                </div>

                <div className="hidden border-l border-border/40 pl-2 sm:block">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onClearSelection}
                        className="rounded-full p-0 text-background/70 hover:bg-background/20 hover:text-background size-8"
                        aria-label="Clear selection"
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
