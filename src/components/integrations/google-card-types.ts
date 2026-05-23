export interface GoogleCardProps {
    platform?: {
        id: string;
        external_id: string;
        last_synced_at: string | null;
        google_location_id?: string | null;
        google_account_id?: string | null;
        google_performance_synced_at?: string | null;
        sync_status: string | null;
        total_reviews: number;
        average_rating?: number | null;
    } | null;
    businessId: string;
    businessName?: string | null;
    /** All Google rows in `reviews` including hidden (`is_visible = false`); optional diagnostics only. */
    dbGoogleSyncedRowCount?: number;
    /** Visible Google rows (`is_visible = true`) — primary count for UI and polling seed. */
    dbVisibleGoogleReviewCount?: number;
    dbVisibleGoogleAverageRating?: number | null;
}
