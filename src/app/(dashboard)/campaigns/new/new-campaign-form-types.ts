export interface CampaignForm {
    name: string;
    channel: "sms" | "email" | "both";
    trigger_type: "manual_batch" | "scheduled" | "pos_payment";
    sms_template: string;
    email_subject: string;
    email_template: string;
    delay_minutes: number;
    follow_up_enabled: boolean;
    follow_up_delay_hours: number;
    /** Stop reminders once the customer opens the review link (a click is not a review). */
    stop_on_click: boolean;
    follow_up_template: string;
    drip_step3_template: string;
}
