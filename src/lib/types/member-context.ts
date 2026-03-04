/**
 * Shared interfaces for Supabase deep-join query results.
 * These replace `as any` casts when the Supabase JS client
 * cannot infer nested relation types from `.select()` strings.
 */

/** A business record nested inside an organization join */
export interface NestedBusiness {
    id: string;
    slug?: string;
    review_platforms?: Array<{ id: string; platform: string }>;
}

/** Result shape for organization_members → organizations → businesses joins */
export interface MemberOrgContext {
    organizations: {
        businesses: NestedBusiness[];
    } | null;
}

/** Result shape for queries that also fetch review_platforms on the business */
export interface MemberOrgWithPlatforms extends MemberOrgContext {
    organizations: {
        businesses: Array<NestedBusiness & {
            review_platforms: Array<{ id: string; platform: string }>;
        }>;
    } | null;
}

/** A customer record that includes the `last_request_sent_at` timestamp */
export interface CustomerRecord {
    last_request_sent_at?: string | null;
}

/** Organization plan data for AI quota enforcement */
export interface OrgWithPlan {
    plan: string;
    ai_replies_used_this_month: number;
}
