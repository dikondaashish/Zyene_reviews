import type {
    BusinessContextBusiness,
    BusinessContextOrganization,
    BusinessContextReviewPlatform,
} from "@/types/business-context";

const DISPLAY_PLATFORM_KEYS = [
    "id", "platform", "external_url", "google_location_id", "google_account_id",
    "granted_scopes", "sync_status", "last_synced_at", "google_qa_unavailable",
    "google_lodging_health_score", "google_lodging_available",
    "google_performance_synced_at", "google_profile_health_score",
    "average_rating", "total_reviews",
] as const;

function displayPlatform(platform: BusinessContextReviewPlatform): BusinessContextReviewPlatform {
    const safe: Record<string, unknown> = {};
    for (const key of DISPLAY_PLATFORM_KEYS) {
        if (Object.hasOwn(platform, key)) safe[key] = platform[key];
    }
    return safe;
}

export function displayBusiness(business: BusinessContextBusiness): BusinessContextBusiness {
    return {
        ...business,
        review_platforms: business.review_platforms?.map(displayPlatform),
    };
}

export function displayOrganization(
    organization: BusinessContextOrganization,
): BusinessContextOrganization {
    return {
        ...organization,
        businesses: organization.businesses?.map(displayBusiness),
    };
}
