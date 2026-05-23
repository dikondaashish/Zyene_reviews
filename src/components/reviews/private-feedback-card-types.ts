export interface PrivateFeedback {
    id: string;
    rating: number;
    content: string;
    created_at: string;
    customer_email?: string | null;
    customer_phone?: string | null;
    status?: string | null;
    category?: string | null;
    selected_staff?: string[] | null;
    review_requests?: {
        customer_name?: string;
        customer_email?: string;
        customer_phone?: string;
    } | null;
}
