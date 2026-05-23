import type { Review, ReviewCardTone } from "@/components/reviews/review-card-types";
import { ReviewCardPendingReplyActions } from "@/components/reviews/review-card-pending-actions";
import { ReviewCardDetailsAndMenu } from "@/components/reviews/review-card-details-and-menu";

export function ReviewCardActions({
    review,
    isReplying,
    activeTone,
    detailOpen,
    onDetailOpenChange,
    isUpdatingStatus,
    onUpdateStatus,
    googleMapsHref,
    onPhotoClick,
    onCancelReplyComposer,
    onSetReplying,
    onToneClick,
    onSuggestProfessional,
}: {
    review: Review;
    isReplying: boolean;
    activeTone: ReviewCardTone | null;
    detailOpen: boolean;
    onDetailOpenChange: (open: boolean) => void;
    isUpdatingStatus: boolean;
    onUpdateStatus: (status: "pending" | "ignored") => void;
    googleMapsHref: string | null;
    onPhotoClick: (url: string) => void;
    onCancelReplyComposer: () => void;
    onSetReplying: (v: boolean) => void;
    onToneClick: (tone: ReviewCardTone) => void;
    onSuggestProfessional: () => void;
}) {
    return (
        <div className="relative z-10 mt-1 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:pt-2">
            {review.response_status !== "responded" && (
                <ReviewCardPendingReplyActions
                    review={review}
                    isReplying={isReplying}
                    activeTone={activeTone}
                    onCancelReplyComposer={onCancelReplyComposer}
                    onSetReplying={onSetReplying}
                    onToneClick={onToneClick}
                    onSuggestProfessional={onSuggestProfessional}
                />
            )}

            <ReviewCardDetailsAndMenu
                review={review}
                detailOpen={detailOpen}
                onDetailOpenChange={onDetailOpenChange}
                isUpdatingStatus={isUpdatingStatus}
                onUpdateStatus={onUpdateStatus}
                googleMapsHref={googleMapsHref}
                onPhotoClick={onPhotoClick}
            />
        </div>
    );
}
