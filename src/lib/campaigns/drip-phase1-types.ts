export type DripCampaignRow = {
    id: string;
    follow_up_enabled: boolean;
    follow_up_template: string | null;
    drip_step3_template: string | null;
    drip_channel_alternate: boolean | null;
    channel: string;
    businesses:
        | { id: string; name: string; sender_name?: string | null }
        | { id: string; name: string; sender_name?: string | null }[]
        | null;
};

export type DripRequestRow = {
    id: string;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    drip_status: string | null;
    drip_steps_sent: number | null;
    review_left: boolean | null;
    clicked_at: string | null;
    completed_at: string | null;
    last_drip_channel: string | null;
    sent_at: string | null;
    step2_sent_at: string | null;
};
