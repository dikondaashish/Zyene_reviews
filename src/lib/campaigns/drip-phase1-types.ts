export type DripCampaignRow = {
    id: string;
    business_id: string;
    status: string;
    follow_up_enabled: boolean;
    follow_up_template: string | null;
    drip_step3_template: string | null;
    drip_channel_alternate: boolean | null;
    channel: string;
    follow_up_delay_hours?: number | null;
    stop_on_click?: boolean | null;
    businesses:
        | { id: string; organization_id: string; name: string; slug?: string | null; sender_name?: string | null; timezone?: string | null }
        | { id: string; organization_id: string; name: string; slug?: string | null; sender_name?: string | null; timezone?: string | null }[]
        | null;
};

export type DripRequestRow = {
    id: string;
    business_id: string;
    campaign_id: string;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    drip_status: string | null;
    drip_steps_sent: number | null;
    review_left: boolean | null;
    clicked_at: string | null;
    completed_at: string | null;
    review_confirmed_at?: string | null;
    last_drip_channel: string | null;
    sent_at: string | null;
    step2_sent_at: string | null;
};
