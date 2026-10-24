import { Suspense } from "react";
import { MilestoneCelebration } from "@/components/dashboard/milestone-celebration";
import { WelcomeTourDialog } from "@/components/dashboard/welcome-tour/welcome-tour-dialog";
import { DemoModeBanner } from "@/components/dashboard/demo-mode-banner";
import { GettingStartedBanner } from "@/components/dashboard/getting-started-banner";
import {
    hasSentReviewRequest,
    shouldShowGettingStartedBanner,
} from "@/components/dashboard/getting-started-visibility";
import { DashboardViewBottomRow } from "./dashboard-view-bottom-row";
import { DashboardViewHeader } from "./dashboard-view-header";
import { DashboardViewStatCards } from "./dashboard-view-stat-cards";
import { DashboardViewTopRow } from "./dashboard-view-top-row";
import { DashboardViewWaiting } from "./dashboard-view-waiting";
import { DashboardViewRecentAutomations } from "./dashboard-view-recent-automations";
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
    } = props;
    const requestSent = hasSentReviewRequest({
        hasEngagementData,
        requestsThisMonth,
    });
    const showGettingStarted = shouldShowGettingStartedBanner({
        isGoogleConnected,
        hasSentReviewRequest: requestSent,
    });

    return (
        <div className="flex min-w-0 w-full flex-col gap-6 overflow-x-hidden">
            {props.welcome ? (
                <WelcomeTourDialog data={props.welcome} />
            ) : (
                <MilestoneCelebration businessId={business.id} isDemo={useDemoData} />
            )}

            {useDemoData && <DemoModeBanner className="mb-2" />}

            <DashboardViewHeader user={user} dict={dict} business={business} />

            {!useDemoData && (
                <Suspense fallback={null}>
                    <DashboardViewWaiting
                        user={user}
                        business={business}
                        isGoogleConnected={isGoogleConnected}
                        brokenPlaceLinksCount={props.brokenPlaceLinksCount}
                        includeSetup={!showGettingStarted}
                    />
                </Suspense>
            )}

            {showGettingStarted && (
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

            {/* Four blocks: what needs you (above), your reputation, what Zyene did, reviews to answer.
                Charts and Google listing detail live on Analytics and Google SEO/AEO. */}
            <DashboardViewStatCards {...props} />
            {!useDemoData && (
                <Suspense fallback={null}>
                    <DashboardViewRecentAutomations businessId={business.id} />
                </Suspense>
            )}
            <DashboardViewBottomRow {...props} />
            <DashboardViewTopRow business={business} />
        </div>
    );
}
