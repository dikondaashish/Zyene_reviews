import { CornerDownRight, Pencil, Trash2 } from "lucide-react";
import {
    REVIEW_RESPONSE_SOURCE_ZYENE,
    REVIEW_RESPONSE_SOURCE_ZYENE_AUTO,
} from "@/lib/reviews/response-source";
import type { Review } from "@/components/reviews/review-card-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ReviewCardExistingResponse({
    review,
    isEditingReply,
    canManageGoogleReply,
    onStartEditReply,
    onOpenDeleteReply,
}: {
    review: Review;
    isEditingReply: boolean;
    canManageGoogleReply: boolean;
    onStartEditReply: () => void;
    onOpenDeleteReply: () => void;
}) {
    if (!(review.response_status === "responded" && review.response_text && !isEditingReply)) {
        return null;
    }

    return (
        <div className="relative z-10 mt-5 ml-0 animate-in rounded-md border-l-2 border-primary bg-muted p-3 text-sm fade-in zoom-in-95 duration-200 sm:ml-4">
            <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground">
                    <CornerDownRight className="text-muted-foreground shrink-0 size-3" />
                    <span className="font-semibold shrink-0">Your Response</span>
                    {review.responded_at && (
                        <time
                            dateTime={review.responded_at}
                            className="text-muted-foreground font-normal text-[10px] tabular-nums shrink-0"
                        >
                            {new Date(review.responded_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </time>
                    )}
                    {review.response_source === REVIEW_RESPONSE_SOURCE_ZYENE && (
                        <Badge
                            variant="secondary"
                            className="h-5 px-2 text-[10px] font-medium bg-sync-action/10 text-sync-action border-sync-action/30"
                        >
                            Replied via Zyene Reviews
                        </Badge>
                    )}
                    {review.response_source === REVIEW_RESPONSE_SOURCE_ZYENE_AUTO && (
                        <Badge
                            variant="secondary"
                            className="h-5 px-2 text-[10px] font-medium bg-primary/10 text-primary border-primary/30"
                        >
                            AI auto commenter · Zyene Reviews
                        </Badge>
                    )}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1">
                    {canManageGoogleReply && (
                        <>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={onStartEditReply}
                            >
                                <Pencil className="mr-1 size-3" />
                                Edit
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={onOpenDeleteReply}
                            >
                                <Trash2 className="mr-1 size-3" />
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            </div>
            <p className="break-words text-muted-foreground">{review.response_text}</p>
        </div>
    );
}
