export interface Review {
    id: string;
    business_id: string;
    author_name: string;
    /** Google/Yelp profile image when the platform provides one */
    author_avatar_url?: string | null;
    rating: number;
    content?: string;
    text?: string;
    published_at?: string;
    review_date?: string;
    created_at?: string;
    response_status: "pending" | "responded" | "ignored";
    response_text?: string;
    responded_at?: string;
    /** zyene = manual from app; zyene_auto = Auto commenter; google = replied on GBP */
    response_source?: string | null;
    platform: string;
    review_photo_urls?: string[] | null;
    google_attribute_chips?: string[] | null;
    google_place_context?: string[] | null;
    sentiment?: "positive" | "negative" | "neutral" | "mixed";
    urgency_score?: number;
    themes?: string[];
    selected_staff?: string[] | null;
}

export const REVIEW_CARD_TONES = ["professional", "friendly", "concise"] as const;
export type ReviewCardTone = (typeof REVIEW_CARD_TONES)[number];

export interface ReviewCardProps {
    review: Review;
    /** Business listing on Google Maps (from GBP link); used when review photos are not in the API. */
    googleMapsListingUrl?: string | null;
    /** Starter+ / Professional / Enterprise — required for AI suggest-reply */
    planAllowsAiReplies?: boolean;
    isSelected?: boolean;
    onSelect?: (id: string, selected: boolean) => void;
    onRefresh?: () => void;
}
