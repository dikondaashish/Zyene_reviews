import { logger } from "@/lib/logger";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import type { ReactElement } from "react";
import type { DashboardAuthContext } from "./load-dashboard-auth";

export async function loadDashboardGoogleHealth(
    auth: DashboardAuthContext,
): Promise<{ unansweredQaCount: number; brokenPlaceLinksCount: number; errorElement?: ReactElement }> {
    let unansweredQaCount = 0;
    let brokenPlaceLinksCount = 0;

    const { supabase, business, useDemoData, isGoogleConnected, googleQaUnavailable } = auth;

    if (useDemoData) {
        return { unansweredQaCount: 3, brokenPlaceLinksCount: 1 };
    }

    if (!business.id || !isGoogleConnected) {
        return { unansweredQaCount, brokenPlaceLinksCount };
    }

    if (googleQaUnavailable) {
        const plRes = await supabase
            .from("gbp_place_action_links")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .eq("is_broken", true);
        if (plRes.error) {
            logger.error({ err: plRes.error }, "[Dashboard page] Google health fetch failed:");
            return {
                unansweredQaCount,
                brokenPlaceLinksCount,
                errorElement: (
                    <DashboardFetchError
                        message="We could not load Google health metrics. Check your connection and try again."
                        retryHref="/dashboard"
                    />
                ),
            };
        }
        return { unansweredQaCount: 0, brokenPlaceLinksCount: plRes.count ?? 0 };
    }

    const [qaRes, plRes] = await Promise.all([
        supabase
            .from("gbp_questions")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .eq("has_merchant_answer", false),
        supabase
            .from("gbp_place_action_links")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .eq("is_broken", true),
    ]);
    if (qaRes.error || plRes.error) {
        logger.error({ err: qaRes.error || plRes.error }, "[Dashboard page] Google health fetch failed:");
        return {
            unansweredQaCount,
            brokenPlaceLinksCount,
            errorElement: (
                <DashboardFetchError
                    message="We could not load Google health metrics. Check your connection and try again."
                    retryHref="/dashboard"
                />
            ),
        };
    }

    return {
        unansweredQaCount: qaRes.count ?? 0,
        brokenPlaceLinksCount: plRes.count ?? 0,
    };
}
