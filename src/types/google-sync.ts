import type { Database } from "@/lib/db/supabase/database.types";

export type ReviewPlatformRow = Database["public"]["Tables"]["review_platforms"]["Row"];

/** `review_platforms` row with decrypted OAuth tokens in memory (not persisted as plaintext). */
export type GooglePlatformWithTokens = ReviewPlatformRow & {
    access_token: string | null;
    refresh_token: string | null;
};

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
