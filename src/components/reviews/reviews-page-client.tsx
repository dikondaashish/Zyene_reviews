"use client";

import { UpgradeModal } from "@/components/settings/upgrade-modal";
import type { ReviewManagementItem } from "@/types/components";
import type { PrivateFeedback } from "@/components/reviews/private-feedback-card";
import type { ReviewsPageClientProps } from "@/components/reviews/reviews-page-client-types";
import { useReviewsPageClientList } from "@/components/reviews/use-reviews-page-client-list";
import { useReviewsPageClientBackfill } from "@/components/reviews/use-reviews-page-client-backfill";
import { ReviewsPageClientHeader } from "@/components/reviews/reviews-page-client-header";
import { ReviewsPageClientTypeTabs } from "@/components/reviews/reviews-page-client-type-tabs";
import { ReviewsPageClientPublicPanel } from "@/components/reviews/reviews-page-client-public-panel";
import { ReviewsPageClientPrivatePanel } from "@/components/reviews/reviews-page-client-private-panel";
import { ReviewsPageClientPaginationBlock } from "@/components/reviews/reviews-page-client-pagination-block";

export function ReviewsPageClient(props: ReviewsPageClientProps) {
    const l = useReviewsPageClientList(props);
    const b = useReviewsPageClientBackfill(props.businessId);

    return (
        <div className="min-w-0 space-y-5">
            <ReviewsPageClientHeader
                count={l.publicCount + l.privateCount}
                isDemo={props.isDemo}
                businessId={props.businessId}
                exportType={l.type}
                isGoogleConnected={props.isGoogleConnected}
                autoCommenterPlanOk={props.autoCommenterPlanOk}
                autoReplyInitial={props.autoReplyInitial}
            />

            <ReviewsPageClientTypeTabs
                type={l.type}
                publicCount={l.publicCount}
                privateCount={l.privateCount}
                loading={l.loading}
                isImportingGoogleReviews={l.isImportingGoogleReviews}
                isBackfillingAi={b.isBackfillingAi}
                onTypeChange={l.handleTypeChange}
                onBackfillAi={b.handleBackfillAi}
            />

            {l.type === "public" ? (
                <ReviewsPageClientPublicPanel
                    businessId={props.businessId}
                    googleMapsListingUrl={props.googleMapsListingUrl}
                    planAllowsAiReplies={props.autoCommenterPlanOk}
                    filters={l.filters}
                    loading={l.loading}
                    reviews={l.reviews as ReviewManagementItem[]}
                    isImportingGoogleReviews={l.isImportingGoogleReviews}
                    publicCount={l.publicCount}
                    resultCount={l.count}
                    onFilterChange={l.handleFilterChange}
                    onRefresh={l.refresh}
                />
            ) : (
                <ReviewsPageClientPrivatePanel loading={l.loading} reviews={l.reviews as PrivateFeedback[]} />
            )}

            <ReviewsPageClientPaginationBlock
                totalPages={l.totalPages}
                page={l.page}
                loading={l.loading}
                onPageChange={l.handlePageChange}
            />

            <UpgradeModal
                isOpen={b.showUpgradeModal}
                onClose={() => b.setShowUpgradeModal(false)}
                context="ai_analysis"
            />
        </div>
    );
}
