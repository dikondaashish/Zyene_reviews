/** Google review sync — types */

import { SyncStateManager } from "@/services/google/sync-state-manager";
import type { GooglePlatformWithTokens } from "@/types/google-sync";

export interface SyncResult {
    success: boolean;
    total: number;
    fetched?: number;
    analyzed: number;
    alerts: number;
}

export interface GoogleSyncContext {
    platform: GooglePlatformWithTokens;
    accessToken: string;
    googleAccountId: string;
    googleLocationId: string;
    lastReviewUpdateTime: string | null;
    syncStateManager: SyncStateManager;
    /** Mutable counter used for checkpointing. */
    reviewsProcessed: number;
    /** Highest review.updateTime seen during this sync run. */
    highestReviewUpdateTime: string | null;
    /** True when Google accepts orderBy=updateTime desc for this location. */
    orderByUpdateTimeEnabled: boolean;
    /**
     * After the first list call we compare visible DB rows to Google `totalReviewCount`.
     * Used once per sync so we do not repeat the count query every page.
     */
    reviewGapCheckDone?: boolean;
}

