export interface ReviewRequest {
    id: string;
    status: string;
    channel: string;
    trigger_source: string;
    campaign_id: string | null;
    created_at: string;
    sent_at: string | null;
    delivered_at: string | null;
    opened_at: string | null;
    clicked_at: string | null;
    completed_at: string | null;
    rating_given: number | null;
    tags_selected: string[] | null;
    review_left: boolean;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    follow_up_sent_at: string | null;
    ai_review_text: string | null;
}

export interface PrivateFeedback {
    id: string;
    rating: number;
    content: string | null;
    created_at: string;
}

export interface ZyenePlatformAnalyticsProps {
    requests: ReviewRequest[];
    previousRequests: ReviewRequest[];
    privateFeedback: PrivateFeedback[];
    dateRange: string;
}
