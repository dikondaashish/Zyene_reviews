import { MilestoneCelebration } from "@/components/dashboard/milestone-celebration";
import { DemoModeBanner } from "@/components/dashboard/demo-mode-banner";
import { GettingStartedBanner } from "@/components/dashboard/getting-started-banner";
import {
    hasSentReviewRequest,
    shouldShowGettingStartedBanner,
} from "@/components/dashboard/getting-started-visibility";
import { DashboardViewBottomRow } from "./dashboard-view-bottom-row";
import { DashboardViewCharts } from "./dashboard-view-charts";
import { DashboardViewExtendedStats } from "./dashboard-view-extended-stats";
import { DashboardViewGoogleHealth } from "./dashboard-view-google-health";
import { DashboardViewGooglePerformance } from "./dashboard-view-google-performance";
import { DashboardViewHeader } from "./dashboard-view-header";
import { DashboardViewStatCards } from "./dashboard-view-stat-cards";
import { DashboardViewTopRow } from "./dashboard-view-top-row";
import type { DashboardViewProps } from "./types";

export function DashboardView(props: DashboardViewProps) {
    const {
        user,
        dict,
        business,
        useDemoData,
        isGoogleConnected,
        customerCount,
        notificationsConfigured,
        canConfigureNotifications = true,
        requestsThisMonth,
        hasEngagementData,
        displayTotalReviews,
    } = props;
    const requestSent = hasSentReviewRequest({
        hasEngagementData,
        requestsThisMonth,
    });

    return (
        <div className="flex min-w-0 w-full flex-col gap-6 overflow-x-hidden">
            <MilestoneCelebration businessId={business.id} isDemo={useDemoData} />

            {useDemoData && <DemoModeBanner className="mb-2" />}

            <DashboardViewHeader user={user} dict={dict} business={business} />

            {shouldShowGettingStartedBanner({
                isGoogleConnected,
                hasSentReviewRequest: requestSent,
            }) && (
                <div className="mt-2">
                    <GettingStartedBanner
                        googleConnected={isGoogleConnected}
                        customerCount={customerCount}
                        requestSent={requestSent}
                        notificationsConfigured={notificationsConfigured}
                        canConfigureNotifications={canConfigureNotifications}
                    />
                </div>
            )}

            <DashboardViewTopRow business={business} />
            <DashboardViewStatCards {...props} />
            <DashboardViewGoogleHealth {...props} />
            <DashboardViewGooglePerformance {...props} />
            <DashboardViewExtendedStats {...props} />
            <DashboardViewCharts {...props} />
            <DashboardViewBottomRow {...props} />
        </div>
    );
}
