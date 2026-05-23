import type { IntegrationPlatformSummary } from "@/types/components";

export interface FacebookCardProps {
    platform: IntegrationPlatformSummary | null;
    businessId: string;
    businessName: string;
    /** All Facebook rows in `reviews` for this business. */
    dbFacebookSyncedRowCount?: number;
    /** Live `reviews` aggregates (`is_visible = true`, platform facebook). */
    dbVisibleFacebookReviewCount?: number;
    dbVisibleFacebookAverageRating?: number | null;
}
