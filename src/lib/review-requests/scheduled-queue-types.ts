export type DueRow = {
    id: string;
    business_id: string;
    customer_name: string | null;
    customer_phone: string | null;
    customer_email: string | null;
    channel: string;
};

export type BusinessRow = {
    id: string;
    name: string | null;
    slug: string | null;
    email: string | null;
    sender_name: string | null;
    review_request_frequency_cap_days: number | null;
    organization_id: string;
};

export type PreparedScheduledSend = {
    b: BusinessRow;
    channel: string;
    phoneNorm: string | null;
    emailNorm: string | null;
    displayName: string;
    reviewLink: string;
    businessId: string;
    requestId: string;
    customerName: string | null;
};
