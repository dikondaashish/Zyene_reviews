export type OrganizationRole = 'ORG_OWNER' | 'ORG_MANAGER' | 'ORG_EMPLOYEE';
export type StoreRole = 'STORE_OWNER' | 'STORE_MANAGER' | 'STORE_EMPLOYEE';

export interface OrganizationMember {
    id: string;
    organization_id: string;
    user_id: string;
    role: OrganizationRole;
    status: 'active' | 'invited' | 'suspended';
    created_at: string;
    // Joins
    users?: {
        full_name: string;
        email: string;
        avatar_url?: string;
    };
    organizations?: {
        name: string;
        slug: string;
    };
}

export interface BusinessMember {
    id: string;
    business_id: string;
    user_id: string;
    role: StoreRole;
    status: 'active' | 'invited' | 'suspended';
    created_at: string;
    // Joins
    users?: {
        full_name: string;
        email: string;
        avatar_url?: string;
    };
    businesses?: {
        name: string;
        slug: string;
    };
}

// Helper to check if a string is a valid OrganizationRole
export function isOrganizationRole(role: string): role is OrganizationRole {
    return ['ORG_OWNER', 'ORG_MANAGER', 'ORG_EMPLOYEE'].includes(role);
}

// Helper to check if a string is a valid StoreRole
export function isStoreRole(role: string): role is StoreRole {
    return ['STORE_OWNER', 'STORE_MANAGER', 'STORE_EMPLOYEE'].includes(role);
}
