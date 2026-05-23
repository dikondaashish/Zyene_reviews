import type { ReviewManagementItem } from "@/types/components";
import type { AutoReplySettingsState } from "./auto-reply-toolbar";
import type { PrivateFeedback } from "./private-feedback-card";

export interface ReviewsPageClientProps {
    businessId: string;
    googleMapsListingUrl?: string | null;
    isDemo: boolean;
    isGoogleConnected: boolean;
    initialGoogleSyncStatus?: string | null;
    initialGoogleLastSyncedAt?: string | null;
    autoCommenterPlanOk: boolean;
    autoReplyInitial: AutoReplySettingsState;
    initialReviews: ReviewManagementItem[] | PrivateFeedback[];
    initialCount: number;
    initialTotalPages: number;
    initialPage: number;
    initialPublicCount: number;
    initialPrivateCount: number;
    initialType: string;
    initialFilters: {
        status: string;
        rating: string;
        sort: string;
    };
}
