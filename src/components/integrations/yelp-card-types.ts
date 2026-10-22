import type { IntegrationPlatformSummary } from "@/types/components";

export interface YelpBusinessResult {
    yelpId: string;
    name: string;
    imageUrl: string;
    yelpUrl: string;
    reviewCount: number;
    rating: number;
    address: string;
    city: string;
    state: string;
    phone: string;
    categories: string[];
}

export interface YelpCardProps {
    platform: IntegrationPlatformSummary | null;
    businessId: string;
    businessName: string;
    /** All Yelp rows in `reviews` for this business. */
    dbYelpSyncedRowCount?: number;
    /** Live `reviews` count (`is_visible = true`, platform yelp). */
    dbVisibleYelpReviewCount?: number;
    /** The Yelp API plan has no review text; only rating and review count sync. */
    reviewsUnavailable?: boolean;
}
