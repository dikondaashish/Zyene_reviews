import { MilestoneCelebration } from "@/components/dashboard/milestone-celebration";
import { DemoModeBanner } from "@/components/dashboard/demo-mode-banner";
import { GettingStartedBanner } from "@/components/dashboard/getting-started-banner";
import {
    hasSentReviewRequest,
    shouldShowGettingStartedBanner,
} from "@/components/dashboard/getting-started-visibility";
import { SmartInsightsCard } from "@/components/dashboard/smart-insights-card";
import { DashboardQrCodeLazy } from "@/components/dashboard/dashboard-ssr-false-blocks";
import { DashboardViewBottomRow } from "./dashboard-view-bottom-row";
import { DashboardViewCharts } from "./dashboard-view-charts";
import { DashboardViewExtendedStats } from "./dashboard-view-extended-stats";
import { DashboardViewGoogleHealth } from "./dashboard-view-google-health";
import { DashboardViewGooglePerformance } from "./dashboard-view-google-performance";
import { DashboardViewHeader } from "./dashboard-view-header";
import { DashboardViewStatCards } from "./dashboard-view-stat-cards";
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

            <DashboardViewStatCards {...props} />
            <DashboardViewBottomRow {...props} />
            <SmartInsightsCard businessName={business.name || ""} />

            <DashboardViewGoogleHealth {...props} />
            <DashboardViewGooglePerformance {...props} />
            <DashboardViewExtendedStats {...props} />
            <DashboardViewCharts {...props} />
            {business.slug && (
                <details className="group rounded-2xl border border-border bg-card p-5">
                    <summary className="cursor-pointer rounded-md font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                        Share your review link
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Download a QR code for your counter, receipts, or next customer visit.
                    </p>
                    <div className="mt-5 max-w-lg">
                        <DashboardQrCodeLazy
                            businessId={business.id}
                            businessSlug={business.slug}
                            businessName={business.name || "Business"}
                            businessLogoUrl={business.logo_url ?? null}
                            brandColor={business.brand_color ?? null}
                            reviewPageBackgroundColor={business.review_page_background_color ?? null}
                        />
                    </div>
                </details>
            )}
        </div>
    );
}
