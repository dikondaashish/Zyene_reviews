import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getActiveBusinessId, getGoogleQaUnavailableForActiveBusiness } from "@/lib/auth/business-context";
import { isGoogleBusinessConnected } from "@/lib/google/is-google-connected";
import type { BusinessContextReviewPlatform } from "@/types/business-context";
import { planAllowsAiReviewFeatures } from "@/services/stripe/plans";
import {
    fetchVisibleReviewRollupsByBusinessIds,
    type VisibleReviewRollup,
} from "@/lib/reviews/visible-review-rollups";
import type {
    BusinessContextBusiness,
    BusinessContextOrganization,
    BusinessExtended,
    ReviewPlatformRow,
} from "./types";

export type DashboardAuthContext = {
    supabase: Awaited<ReturnType<typeof createClient>>;
    user: User;
    business: BusinessExtended;
    organization: BusinessContextOrganization | null;
    planAllowsAiReplies: boolean;
    isPaidPlan: boolean;
    maxRequestsPerMonth: number;
    googlePlatform: ReviewPlatformRow | undefined;
    isGoogleConnected: boolean;
    googleQaUnavailable: boolean;
    useDemoData: boolean;
    showUnansweredQaCard: boolean;
    visibleReviewRollup: VisibleReviewRollup | null;
};

export async function loadDashboardAuth(): Promise<DashboardAuthContext> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { business: activeBiz, organization, businesses: allBusinesses } =
        await getActiveBusinessId();

    const business = (activeBiz || {
        id: "",
        name: "Your Business",
        slug: "",
        status: "inactive",
        total_reviews: 0,
        average_rating: 0,
        review_request_frequency_cap_days: 0,
    }) as BusinessExtended;

    const planStatus = organization?.plan_status || "inactive";
    const isPaidPlan =
        (planStatus === "active" || planStatus === "trialing") && organization?.plan !== "none";
    const planAllowsAiReplies = planAllowsAiReviewFeatures(
        organization?.plan ?? null,
        (organization as { plan_status?: string | null } | null)?.plan_status ?? null,
    );

    const totalOrgLimit = isPaidPlan ? (organization?.max_review_requests_per_month || 5000) : 0;
    const businessCount = Math.max(allBusinesses.length, 1);
    const maxRequestsPerMonth = Math.floor(totalOrgLimit / businessCount);

    const googlePlatform = business.review_platforms?.find(
        (p: ReviewPlatformRow) => p.platform === "google",
    );
    const isGoogleConnected = isGoogleBusinessConnected(
        business.review_platforms as BusinessContextReviewPlatform[] | undefined
    );
    const googleQaUnavailable = business.id
        ? await getGoogleQaUnavailableForActiveBusiness(business.id)
        : false;

    const useDemoData = !isGoogleConnected;

    const showUnansweredQaCard =
        (isGoogleConnected || useDemoData) && (!isGoogleConnected || !googleQaUnavailable);

    let visibleReviewRollup: VisibleReviewRollup | null = null;
    if (business.id && !useDemoData) {
        const rollupMap = await fetchVisibleReviewRollupsByBusinessIds(supabase, [business.id]);
        visibleReviewRollup = rollupMap.get(business.id) ?? null;
    }

    return {
        supabase,
        user,
        business,
        organization,
        planAllowsAiReplies,
        isPaidPlan,
        maxRequestsPerMonth,
        googlePlatform,
        isGoogleConnected,
        googleQaUnavailable,
        useDemoData,
        showUnansweredQaCard,
        visibleReviewRollup,
    };
}

export type { BusinessContextBusiness };
