"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ReviewCardProps } from "@/components/reviews/review-card-types";
import { getReviewGoogleMapsHref } from "@/components/reviews/review-card-derived";
import { useReviewCardReply } from "@/components/reviews/use-review-card-reply";
import { useReviewCardListMutations } from "@/components/reviews/use-review-card-list-mutations";
import { ReviewCardHeader } from "@/components/reviews/review-card-header";
import { ReviewCardBody } from "@/components/reviews/review-card-body";
import { ReviewCardExistingResponse } from "@/components/reviews/review-card-existing-response";
import { ReviewCardActions } from "@/components/reviews/review-card-actions";
import { ReviewCardComposer } from "@/components/reviews/review-card-composer";
import { ReviewCardModals } from "@/components/reviews/review-card-modals";

export type { Review } from "@/components/reviews/review-card-types";

export function ReviewCard({
    review,
    googleMapsListingUrl = null,
    planAllowsAiReplies = true,
    isSelected = false,
    onSelect,
    onRefresh,
}: ReviewCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [activePhoto, setActivePhoto] = useState<string | null>(null);
    const [deleteReplyOpen, setDeleteReplyOpen] = useState(false);

    const reply = useReviewCardReply(review, planAllowsAiReplies, onRefresh);
    const list = useReviewCardListMutations(review, onRefresh, () => setDeleteReplyOpen(false));

    const showReplyComposer =
        (reply.isReplying && review.response_status !== "responded") || reply.isEditingReply;

    const canManageGoogleReply =
        review.platform === "google" &&
        review.response_status === "responded" &&
        !!(review.response_text && review.response_text.trim());

    const googleMapsHref = getReviewGoogleMapsHref(review, googleMapsListingUrl);

    return (
        <div
            className={cn(
                "relative group min-w-0 overflow-hidden rounded-xl border border-border bg-card p-3 transition-all duration-300 sm:p-4",
                "hover:-translate-y-0.5 hover:shadow-lg hover:border-canvas-elevated/60",
                isSelected && "border-primary/30 bg-primary/10 shadow-sm"
            )}
        >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-canvas-elevated/35 via-canvas-elevated/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <ReviewCardHeader review={review} isSelected={isSelected} onSelect={onSelect} />
            <ReviewCardBody
                review={review}
                isExpanded={isExpanded}
                onToggleExpanded={() => setIsExpanded((e) => !e)}
                onPhotoClick={setActivePhoto}
            />
            <ReviewCardExistingResponse
                review={review}
                isEditingReply={reply.isEditingReply}
                canManageGoogleReply={canManageGoogleReply}
                onStartEditReply={reply.startEditReply}
                onOpenDeleteReply={() => setDeleteReplyOpen(true)}
            />
            <ReviewCardActions
                review={review}
                isReplying={reply.isReplying}
                activeTone={reply.activeTone}
                detailOpen={detailOpen}
                onDetailOpenChange={setDetailOpen}
                isUpdatingStatus={list.isUpdatingStatus}
                onUpdateStatus={list.handleUpdateStatus}
                googleMapsHref={googleMapsHref}
                onPhotoClick={setActivePhoto}
                onCancelReplyComposer={reply.cancelReplyComposer}
                onSetReplying={reply.setIsReplying}
                onToneClick={reply.handleToneClick}
                onSuggestProfessional={() => void reply.handleToneClick("professional")}
            />
            {showReplyComposer && (
                <ReviewCardComposer
                    review={review}
                    isEditingReply={reply.isEditingReply}
                    replyText={reply.replyText}
                    isAiTyping={reply.isAiTyping}
                    isSubmitting={reply.isSubmitting}
                    activeTone={reply.activeTone}
                    loadingTone={reply.loadingTone}
                    onReplyTextChange={reply.handleReplyTextChange}
                    onToneClick={reply.handleToneClick}
                    onCancelReplyComposer={reply.cancelReplyComposer}
                    onSubmit={() => void reply.handleSubmit()}
                />
            )}
            <ReviewCardModals
                deleteReplyOpen={deleteReplyOpen}
                onDeleteReplyOpenChange={setDeleteReplyOpen}
                isDeletingReply={list.isDeletingReply}
                onConfirmDeleteReply={list.handleDeleteReply}
                showUpgradeModal={reply.showUpgradeModal}
                onCloseUpgradeModal={() => reply.setShowUpgradeModal(false)}
                upgradeModalKind={reply.upgradeModalKind}
                activePhoto={activePhoto}
                onActivePhotoOpenChange={(open) => {
                    if (!open) setActivePhoto(null);
                }}
            />
        </div>
    );
}
