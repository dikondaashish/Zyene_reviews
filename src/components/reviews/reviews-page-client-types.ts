import type { ReviewManagementItem } from "@/types/components";
import type { AutoReplySettingsState } from "./auto-reply-toolbar";
import type { PrivateFeedback } from "./private-feedback-card";
import type { ReviewStatusCounts } from "@/lib/reviews/status-counts";
import type { ReplyRulesSummary } from "@/services/reviews/reply-rules-summary-load";

export interface ReviewsPageClientProps {
    businessId: string;
    googleMapsListingUrl?: string | null;
    isDemo: boolean;
    isGoogleConnected: boolean;
    initialGoogleSyncStatus?: string | null;
    initialGoogleLastSyncedAt?: string | null;
    autoCommenterPlanOk: boolean;
    autoReplyInitial: AutoReplySettingsState;
    replyRules: ReplyRulesSummary;
    businessName: string;
    initialReviews: ReviewManagementItem[] | PrivateFeedback[];
    initialCount: number;
    initialTotalPages: number;
    initialPage: number;
    initialPublicCount: number;
    initialPrivateCount: number;
    initialStatusCounts: ReviewStatusCounts | null;
    initialType: string;
    initialFilters: {
        status: string;
        rating: string;
        sort: string;
        q?: string;
    };
}
