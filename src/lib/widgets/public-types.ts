export type PublicWidgetReview = {
    id: string; author_name: string; rating: number; content: string; platform: string;
    created_at: string; external_url?: string; avatar?: string; photos?: string[]; summary?: string;
};
export type PublicWidgetData = {
    businessName: string; reviewsUrl: string; writeReviewUrl?: string; hideBranding: boolean;
    reviewCount: number; averageRating: number; googleCount: number; googleRating: number;
    reviews: PublicWidgetReview[];
};
