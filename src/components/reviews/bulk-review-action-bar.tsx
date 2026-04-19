"use client";

import { Button } from "@/components/ui/button";
import { Check, X, EyeOff, Loader2 } from "lucide-react";
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
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();

    const handleBulkStatusUpdate = async (status: 'ignored' | 'pending') => {
        setIsUpdating(true);
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
            toast.success(`Successfully updated ${updatedCount} reviews`);
            onClearSelection();
            onRefresh ? onRefresh() : router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(message);
        } finally {
            setIsUpdating(false);
        }
    };

    if (selectedIds.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-foreground text-background rounded-full px-4 py-2 flex items-center gap-4 border border-border">
                <div className="flex items-center gap-2 border-r border-border/40 pr-4">
                    <div className="bg-primary text-primary-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                        {selectedIds.length}
                    </div>
                    <span className="text-xs font-medium">Selected</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleBulkStatusUpdate('ignored')}
                        disabled={isUpdating}
                        className="h-8 text-xs text-background/80 hover:text-background hover:bg-background/20 rounded-full"
                    >
                        {isUpdating ? (
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                            <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Mark as Ignored
                    </Button>

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleBulkStatusUpdate('pending')}
                        disabled={isUpdating}
                        className="h-8 text-xs text-background/80 hover:text-background hover:bg-background/20 rounded-full"
                    >
                        <Check className="w-3.5 h-3.5 mr-1.5 text-chart-2" />
                        Move to Pending
                    </Button>
                </div>

                <div className="pl-2 border-l border-border/40">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onClearSelection}
                        className="h-8 w-8 p-0 text-background/70 hover:text-background hover:bg-background/20 rounded-full"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
