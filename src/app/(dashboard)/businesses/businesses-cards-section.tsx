import { BusinessesEmptyState } from "@/app/(dashboard)/businesses/businesses-empty-state";
import { BusinessDirectory } from "@/components/businesses/business-directory";
import { getGoogleConnectionStatus } from "@/lib/google/is-google-connected";
import type { VisibleReviewRollup } from "@/lib/reviews/visible-review-rollups";
import type { BusinessContextBusiness } from "@/types/business-context";
import type { BusinessDirectoryEntry } from "@/types/business-directory";

export function BusinessesCardsSection({ businesses, activeBusinessId, visibleReviewStats }: {
    businesses: BusinessContextBusiness[];
    activeBusinessId: string | null | undefined;
    visibleReviewStats: Map<string, VisibleReviewRollup>;
}) {
    if (businesses.length === 0) return <BusinessesEmptyState />;

    // Project only display data across the client boundary, never platform credentials.
    const entries: BusinessDirectoryEntry[] = businesses.map((business) => {
        const stats = visibleReviewStats.get(business.id);
        return {
            id: business.id,
            name: business.name || "Unnamed business",
            category: business.category || "Business",
            address: [business.address_line1, business.city, business.state]
                .filter((part): part is string => typeof part === "string" && part.trim().length > 0).join(", "),
            logoUrl: typeof business.logo_url === "string" ? business.logo_url : null,
            status: business.status ?? null,
            googleStatus: getGoogleConnectionStatus(business.review_platforms),
            rating: stats?.totalVisible ? stats.averageRatingVisible : null,
            reviewCount: stats?.totalVisible ?? 0,
            pendingReviews: stats?.pendingVisible ?? 0,
        };
    });
    return <BusinessDirectory businesses={entries} activeBusinessId={activeBusinessId} />;
}
