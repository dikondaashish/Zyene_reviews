"use client";

import { UpgradeModal } from "@/components/settings/upgrade-modal";
import type { ReviewManagementItem } from "@/types/components";
import type { PrivateFeedback } from "./private-feedback-card";
import type { ReviewsPageClientProps } from "./reviews-page-client-types";
import { useReviewsPageClientList } from "./use-reviews-page-client-list";
import { useReviewsPageClientBackfill } from "./use-reviews-page-client-backfill";
import { ReviewsPageClientHeader } from "./reviews-page-client-header";
import { ReviewsPageClientTypeTabs } from "./reviews-page-client-type-tabs";
import { ReviewsPageClientPublicPanel } from "./reviews-page-client-public-panel";
import { ReviewsPageClientPrivatePanel } from "./reviews-page-client-private-panel";
import { ReviewsPageClientPaginationBlock } from "./reviews-page-client-pagination-block";

export function ReviewsPageClient(props: ReviewsPageClientProps) {
    const l = useReviewsPageClientList(props);
    const b = useReviewsPageClientBackfill(props.businessId);

    return (
        <div className="min-w-0">
            <ReviewsPageClientHeader
                count={l.count}
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
