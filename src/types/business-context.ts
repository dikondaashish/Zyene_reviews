export interface BusinessContextReviewPlatform {
    id?: string;
    platform?: string;
    sync_status?: string;
    [key: string]: unknown;
}

export interface BusinessContextBusiness {
    id: string;
    name?: string | null;
    slug?: string | null;
    status?: string | null;
    category?: string | null;
    total_reviews?: number;
    average_rating?: number;
    review_request_frequency_cap_days?: number;
    review_platforms?: BusinessContextReviewPlatform[];
    [key: string]: unknown;
}

export interface BusinessContextOrganization {
    id: string;
    name?: string | null;
    plan_name?: string | null;
    plan?: string | null;
    plan_status?: string | null;
    max_businesses?: number | null;
    max_review_requests_per_month?: number | null;
    onboarding_completed?: boolean;
    businesses: BusinessContextBusiness[];
    [key: string]: unknown;
}

export interface OrganizationMemberWithBusinesses {
    organizations: BusinessContextOrganization | null;
}
