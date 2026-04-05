export interface BusinessContextReviewPlatform {
    id?: string;
    platform?: string;
    sync_status?: string;
    [key: string]: unknown;
}

export interface BusinessContextBusiness {
    id: string;
    status?: string | null;
    review_platforms?: BusinessContextReviewPlatform[];
    [key: string]: unknown;
}

export interface BusinessContextOrganization {
    businesses: BusinessContextBusiness[];
    [key: string]: unknown;
}

export interface OrganizationMemberWithBusinesses {
    organizations: BusinessContextOrganization | null;
}
