import { logger } from "@/lib/logger";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import type { ReactElement } from "react";
import type { DashboardCachedStats } from "./types";
import type { DashboardAuthContext } from "./load-dashboard-auth";
import type { DashboardStatsState } from "./load-dashboard-stats-state";

export async function loadDashboardStatsFromCache(
    auth: DashboardAuthContext,
    stats: DashboardStatsState,
    cachedStatsRaw: unknown,
): Promise<{ stats: DashboardStatsState; errorElement?: ReactElement }> {
    const { supabase, user, business, useDemoData, visibleReviewRollup } = auth;

    const parsed =
        (typeof cachedStatsRaw === "string" ? JSON.parse(cachedStatsRaw) : cachedStatsRaw) as DashboardCachedStats;

    stats.responseRate = parsed.responseRate || 0;
    stats.pendingCount = parsed.pendingCount || 0;
    stats.recentReviews = parsed.recentReviews || [];
    stats.attentionReviews = parsed.attentionReviews || [];
    stats.trendData = parsed.trendData || [];
    stats.ratingData = parsed.ratingData || [];
    stats.totalReviewsTrend = parsed.totalReviewsTrend || 0;
    stats.averageRatingTrend = parsed.averageRatingTrend || 0;
    stats.positivePercent = parsed.positivePercent || 0;
    stats.negativePercent = parsed.negativePercent || 0;
    stats.hasSentimentData = parsed.hasSentimentData || false;
    stats.engagementRate = parsed.engagementRate || 0;
    stats.hasEngagementData = parsed.hasEngagementData || false;
    stats.requestsThisMonth = parsed.requestsThisMonth || 0;
    stats.newReviews30d = parsed.newReviews30d || 0;

    if (!useDemoData && visibleReviewRollup) {
        stats.pendingCount = visibleReviewRollup.pendingVisible;
        const { count: respondedVisible, error: respondedVisibleErr } = await supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .eq("is_visible", true)
            .eq("response_status", "responded");
        if (respondedVisibleErr) {
            logger.error(
                { err: respondedVisibleErr },
                "[Dashboard page] Visible responded count failed:",
            );
        } else {
            stats.responseRate =
                visibleReviewRollup.totalVisible > 0
                    ? ((respondedVisible ?? 0) / visibleReviewRollup.totalVisible) * 100
                    : 0;
        }
    }

    const [customerCountCached, notificationPrefsCached] = await Promise.all([
        supabase
            .from("customers")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id),
        supabase
            .from("notification_preferences")
            .select("*")
            .eq("business_id", business.id)
            .eq("user_id", user.id)
            .limit(1),
    ]);
    if (customerCountCached.error || notificationPrefsCached.error) {
        logger.error(
            { err: customerCountCached.error || notificationPrefsCached.error },
            "[Dashboard page] Cached branch fetch failed:",
        );
        return {
            stats,
            errorElement: (
                <DashboardFetchError
                    message="We could not load dashboard stats for this business. Check your connection and try again."
                    retryHref="/dashboard"
                />
            ),
        };
    }
    stats.customerCount = customerCountCached.count || 0;
    stats.notificationsConfigured =
        (notificationPrefsCached.data &&
            notificationPrefsCached.data.length > 0 &&
            (notificationPrefsCached.data[0].email_enabled ||
                notificationPrefsCached.data[0].sms_enabled)) ||
        false;

    return { stats };
}
