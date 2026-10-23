export interface Campaign {
    id: string;
    name: string;
    status: string;
    channel: string;
    trigger_type: string;
    total_sent: number;
    total_opened: number;
    total_clicked: number;
    total_completed: number;
    total_reviews_received: number;
    created_at: string;
}
