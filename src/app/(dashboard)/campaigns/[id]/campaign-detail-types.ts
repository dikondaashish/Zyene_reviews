import type { LucideIcon } from "lucide-react";

export interface Campaign {
    id: string;
    name: string;
    status: string;
    channel: string;
    trigger_type: string;
    sms_template: string;
    email_subject: string;
    email_template: string;
    delay_minutes: number;
    follow_up_enabled: boolean;
    follow_up_delay_hours: number;
    total_sent: number;
    total_opened: number;
    total_clicked: number;
    total_completed: number;
    total_reviews_received: number;
    created_at: string;
}

export interface ReviewRequest {
    id: string;
    customer_name: string | null;
    customer_phone: string | null;
    customer_email: string | null;
    channel: string;
    status: string;
    sent_at: string | null;
    opened_at: string | null;
    clicked_at: string | null;
    created_at: string;
}

export const statusColors: Record<string, string> = {
    sent: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
    delivered: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
    opened: "bg-chart-4/15 text-chart-4 dark:bg-chart-4/20 dark:text-chart-4",
    clicked: "bg-primary/10 text-primary",
    review_left: "bg-chart-2/15 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2",
    completed: "bg-chart-2/15 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2",
    failed: "bg-destructive/15 text-destructive dark:bg-destructive/20 dark:text-destructive",
    sending: "bg-muted text-muted-foreground",
    queued: "bg-muted text-muted-foreground",
};

export interface FunnelStage {
    label: string;
    value: number;
    icon: LucideIcon;
    color: string;
}
