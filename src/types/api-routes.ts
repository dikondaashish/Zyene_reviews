export interface GoogleLocationDetails {
    name: string;
    title: string;
    metadata?: {
        mapsUri?: string;
        newReviewUri?: string;
        placeId?: string;
    };
    phoneNumbers?: {
        primaryPhone?: string;
    };
    storefrontAddress?: {
        addressLines?: string[];
        locality?: string;
        administrativeArea?: string;
        postalCode?: string;
    };
    websiteUri?: string;
    categories?: {
        primaryCategory?: {
            displayName?: string;
        };
    };
}

export interface AuthMemberOrgContext {
    organizations: {
        businesses: Array<{ id: string }>;
    } | null;
}

export interface GooglePlatformUpdatePayload {
    access_token: string | null;
    sync_status: "active";
    updated_at: string;
    refresh_token?: string | null;
}

export interface ReviewRequestExportRow {
    created_at: string;
    sent_at?: string | null;
    customer_name?: string | null;
    customer_phone?: string | null;
    customer_email?: string | null;
    channel: string;
    status: string;
    review_left?: boolean | null;
}

export interface PrivateFeedbackExportRow {
    created_at: string;
    rating: number | null;
    content?: string | null;
    customer_email?: string | null;
    customer_phone?: string | null;
    review_requests?: {
        customer_name?: string | null;
        customer_email?: string | null;
        customer_phone?: string | null;
    } | null;
}

export interface PublicReviewExportRow {
    published_at?: string | null;
    created_at: string;
    rating: number | null;
    author_name?: string | null;
    content?: string | null;
    sentiment?: string | null;
    response_status?: string | null;
    review_platforms?: {
        platform?: string | null;
    } | null;
}

export interface SyncPlatformSummary {
    id: string;
    platform: string;
}

export interface SyncBusinessSummary {
    id: string;
    review_platforms: SyncPlatformSummary[];
}

export interface SyncMemberOrganizationData {
    organizations: {
        businesses: SyncBusinessSummary[];
    } | null;
}

export interface StripeOrganizationUpdatePayload {
    plan_status: string;
    stripe_subscription_id: string;
    plan?: string;
    max_businesses?: number;
    max_review_requests_per_month?: number;
    max_ai_replies_per_month?: number;
    max_email_requests_per_month?: number;
    max_sms_requests_per_month?: number;
    max_link_requests_per_month?: number;
}
