"use server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { fetchVisibleReviewRollupsByBusinessIds } from "@/lib/reviews/visible-review-rollups";
import { NEEDS_REPLY_STATUS, UNHAPPY_MAX_RATING } from "@/lib/reviews/unanswered-reviews";
import { planAllowsAiReviewFeatures, planAllowsAutoCommenter } from "@/services/stripe/plan-entitlements";

export type OnboardingReviewSample = { id: string; author: string; rating: number; text: string; date: string | null };

export type OnboardingResults = {
    /** "importing" while the first Google sync has not stored any reviews yet. */
    status: "importing" | "ready" | "failed";
    total: number;
    averageRating: number;
    unanswered: number;
    unhappy: number;
    samples: OnboardingReviewSample[];
};

type Fail = { success: false; error: string };

async function authorize(businessId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await userCanAccessBusiness(supabase, user.id, businessId))) return null;
    return supabase;
}

/** The owner's own numbers, shown before any plan is offered. Same definitions as the dashboard. */
export async function loadOnboardingResults(businessId: string): Promise<{ success: true; results: OnboardingResults } | Fail> {
    try {
        const supabase = await authorize(businessId);
        if (!supabase) return { success: false, error: "You don't have access to this business." };

        const [{ data: platform }, rollups, { data: samples }] = await Promise.all([
            supabase.from("review_platforms").select("sync_status, last_synced_at")
                .eq("business_id", businessId).eq("platform", "google").maybeSingle(),
            fetchVisibleReviewRollupsByBusinessIds(supabase, [businessId]),
            supabase.from("reviews").select("id, author_name, rating, text, review_date")
                .eq("business_id", businessId).eq("is_visible", true)
                .eq("response_status", NEEDS_REPLY_STATUS).is("responded_at", null)
                .gte("rating", 1).lte("rating", UNHAPPY_MAX_RATING)
                .order("review_date", { ascending: false }).limit(3),
        ]);
        const rollup = rollups.get(businessId);
        const total = rollup?.totalVisible ?? 0;
        const syncStatus = String(platform?.sync_status ?? "").toLowerCase();
        const status: OnboardingResults["status"] =
            total > 0 ? "ready" : syncStatus.startsWith("error") ? "failed" : platform?.last_synced_at ? "ready" : "importing";

        return {
            success: true,
            results: {
                status,
                total,
                averageRating: rollup?.averageRatingVisible ?? 0,
                unanswered: rollup?.pendingVisible ?? 0,
                unhappy: rollup?.unhappyPendingVisible ?? 0,
                samples: (samples ?? []).map((r) => ({
                    id: String(r.id),
                    author: r.author_name || "A customer",
                    rating: Number(r.rating) || 0,
                    text: r.text || "",
                    date: r.review_date ?? null,
                })),
            },
        };
    } catch (err) {
        logger.error({ err, businessId }, "[onboarding] results load failed");
        return { success: false, error: "We couldn't load your reviews. You can carry on and see them on the dashboard." };
    }
}

/** What the plan lets Zyene do with replies, so the automate step only offers what will work. */
export async function loadOnboardingAutomateOptions(
    businessId: string,
): Promise<{ success: true; aiAllowed: boolean; autoAllowed: boolean } | Fail> {
    try {
        const supabase = await authorize(businessId);
        if (!supabase) return { success: false, error: "You don't have access to this business." };
        const { data } = await supabase.from("businesses").select("organizations(plan, plan_status)").eq("id", businessId).maybeSingle();
        const org = (Array.isArray(data?.organizations) ? data?.organizations[0] : data?.organizations) as
            | { plan?: string | null; plan_status?: string | null }
            | null
            | undefined;
        return {
            success: true,
            aiAllowed: planAllowsAiReviewFeatures(org?.plan ?? null, org?.plan_status ?? null),
            autoAllowed: planAllowsAutoCommenter(org?.plan ?? null, org?.plan_status ?? null),
        };
    } catch (err) {
        logger.error({ err, businessId }, "[onboarding] automate options load failed");
        return { success: false, error: "We couldn't check your plan. Try again in a moment." };
    }
}
