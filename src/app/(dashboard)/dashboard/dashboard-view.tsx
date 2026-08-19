import { MilestoneCelebration } from "@/components/dashboard/milestone-celebration";
import { DemoModeBanner } from "@/components/dashboard/demo-mode-banner";
import { GettingStartedBanner } from "@/components/dashboard/getting-started-banner";
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
    organization,
    useDemoData,
    isGoogleConnected,
    customerCount,
    notificationsConfigured,
    canConfigureNotifications = true,
    requestsThisMonth,
    displayTotalReviews,
  } = props;

  return (
    <div className="flex min-w-0 w-full flex-col gap-6 overflow-x-hidden">
      <MilestoneCelebration
        currentCount={displayTotalReviews}
        type="reviews"
        isDemo={useDemoData}
        scopeKey={business.id || "default"}
      />

      {useDemoData && <DemoModeBanner className="mb-2" />}

      <DashboardViewHeader user={user} dict={dict} business={business} />

      {(!organization?.onboarding_completed ||
        !isGoogleConnected ||
        customerCount === 0 ||
        (canConfigureNotifications && !notificationsConfigured)) && (
        <div className="mt-2">
          <GettingStartedBanner
            googleConnected={isGoogleConnected}
            customerCount={customerCount}
            requestSent={requestsThisMonth > 0}
            notificationsConfigured={notificationsConfigured}
            canConfigureNotifications={canConfigureNotifications}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 min-w-0 flex flex-col">
          <SmartInsightsCard businessName={business.name || ""} />
        </div>
        <div className="lg:col-span-2 min-w-0 flex flex-col">
          {business.slug ? (
            <div className="h-full">
              <DashboardQrCodeLazy
                businessId={business.id}
                businessSlug={business.slug}
                businessName={business.name || "Business"}
                businessLogoUrl={business.logo_url ?? null}
                brandColor={business.brand_color ?? null}
                reviewPageBackgroundColor={
                  business.review_page_background_color ?? null
                }
              />
            </div>
          ) : (
            <div className="h-full rounded-2xl bg-[rgb(43,58,42)] p-6 text-white/50 flex flex-col justify-center items-center">
              No active business configuration found.
            </div>
          )}
        </div>
      </div>

      <DashboardViewStatCards {...props} />
      <DashboardViewGoogleHealth {...props} />
      <DashboardViewGooglePerformance {...props} />
      <DashboardViewExtendedStats {...props} />
      <DashboardViewCharts {...props} />
      <DashboardViewBottomRow {...props} />
    </div>
  );
}
