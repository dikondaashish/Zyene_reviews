export interface ReviewAlertPayload {
    id: string;
    business_id: string;
    author_name?: string | null;
    text?: string | null;
    rating?: number | null;
    urgency_score?: number | null;
}

export interface NotificationPreference {
    users: { email: string } | null;
    quiet_hours_start?: string | null;
    quiet_hours_end?: string | null;
    sms_enabled?: boolean;
    phone_number?: string | null;
    email_enabled?: boolean;
}
