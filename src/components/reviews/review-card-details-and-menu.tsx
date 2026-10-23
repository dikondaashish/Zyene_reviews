"use client";

import { useState } from "react";
import { Info, MoreHorizontal } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Review } from "@/components/reviews/review-card-types";
import { ReviewCardDetailsDialogBody } from "@/components/reviews/review-card-details-dialog-body";
import { ReportToGoogleDialog } from "@/components/reviews/report-to-google-dialog";

export function ReviewCardDetailsAndMenu({
    review,
    detailOpen,
    onDetailOpenChange,
    isUpdatingStatus,
    onUpdateStatus,
    googleMapsHref,
    onPhotoClick,
}: {
    review: Review;
    detailOpen: boolean;
    onDetailOpenChange: (open: boolean) => void;
    isUpdatingStatus: boolean;
    onUpdateStatus: (status: "pending" | "ignored") => void;
    googleMapsHref: string | null;
    onPhotoClick: (url: string) => void;
}) {
    const [reportOpen, setReportOpen] = useState(false);
    // Owners mostly want this for unhappy reviews; Google only accepts reports for its own reviews.
    const canReport = review.platform === "google" && review.rating <= 3;
    return (
        <div className="flex w-full items-center justify-between gap-2 sm:ml-auto sm:w-auto sm:justify-end">
            <div className="flex items-center gap-1">
                <Dialog open={detailOpen} onOpenChange={onDetailOpenChange}>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <Info className="mr-1 size-3.5" />
                            Details
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Review details</DialogTitle>
                            <DialogDescription>
                                Additional information and photos shared with this review.
                            </DialogDescription>
                        </DialogHeader>
                        <ReviewCardDetailsDialogBody
                            review={review}
                            googleMapsHref={googleMapsHref}
                            onPhotoClick={onPhotoClick}
                        />
                    </DialogContent>
                </Dialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            aria-label="More review actions"
                            className="p-0 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full size-8"
                        >
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {review.response_status === "ignored" ? (
                            <DropdownMenuItem
                                className="text-xs cursor-pointer"
                                onClick={() => onUpdateStatus("pending")}
                                disabled={isUpdatingStatus}
                            >
                                Move to needs reply
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                className="text-xs cursor-pointer"
                                onClick={() => onUpdateStatus("ignored")}
                                disabled={isUpdatingStatus}
                            >
                                Mark as Ignored
                            </DropdownMenuItem>
                        )}
                        {canReport && (
                            <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => setReportOpen(true)}>
                                Report to Google…
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                {canReport && <ReportToGoogleDialog open={reportOpen} onOpenChange={setReportOpen} authorName={review.author_name} />}
            </div>
        </div>
    );
}
