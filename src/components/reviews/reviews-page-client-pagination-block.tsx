"use client";

import { Button } from "@/components/ui/button";

interface ReviewsPageClientPaginationBlockProps {
    totalPages: number;
    page: number;
    loading: boolean;
    onPageChange: (p: number) => void;
}

export function ReviewsPageClientPaginationBlock({
    totalPages,
    page,
    loading,
    onPageChange,
}: ReviewsPageClientPaginationBlockProps) {
    if (totalPages <= 1) return null;

    return (
        <nav aria-label="Reviews pagination" className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 pb-4 sm:flex sm:justify-end">
            <Button
                variant="outline"
                size="sm"
                className="h-9 w-full sm:h-8 sm:w-auto"
                disabled={page <= 1 || loading}
                onClick={() => onPageChange(page - 1)}
            >
                Previous
            </Button>
            <div className="text-center text-sm text-muted-foreground tabular-nums">
                Page {page} of {totalPages}
            </div>
            <Button
                variant="outline"
                size="sm"
                className="h-9 w-full sm:h-8 sm:w-auto"
                disabled={page >= totalPages || loading}
                onClick={() => onPageChange(page + 1)}
            >
                Next
            </Button>
        </nav>
    );
}
