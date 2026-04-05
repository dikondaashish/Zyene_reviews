export interface PlatformWithTokens {
    access_token: string | null;
    refresh_token: string | null;
    token_expires_at: string | null;
    google_account_id?: string | null;
    google_location_id?: string | null;
    external_id?: string | null;
}

export interface BusinessStatsUpdate {
    total_reviews: number;
    average_rating: number;
}
