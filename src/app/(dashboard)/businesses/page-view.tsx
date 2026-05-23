import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { fetchVisibleReviewRollupsByBusinessIds } from "@/lib/reviews/visible-review-rollups";
import { BusinessesPageHeader } from "./businesses-page-header";
import { BusinessesCardsSection } from "./businesses-cards-section";

export default async function BusinessesPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { businesses, organization, businessId: activeBusinessId } = await getActiveBusinessId();
    const maxLocations = organization?.max_businesses || 1;
    const atLimit = businesses.length >= maxLocations;

    const visibleReviewStats = await fetchVisibleReviewRollupsByBusinessIds(
        supabase,
        businesses.map((b) => b.id)
    );

    return (
        <div className="flex min-w-0 flex-col gap-6 overflow-x-hidden">
            <BusinessesPageHeader atLimit={atLimit} />
            <BusinessesCardsSection
                businesses={businesses}
                activeBusinessId={activeBusinessId}
                visibleReviewStats={visibleReviewStats}
            />
        </div>
    );
}
