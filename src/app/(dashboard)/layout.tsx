import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex-metadata";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};

import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { MobileSidebarFAB } from "@/components/dashboard/mobile-sidebar-fab";
import { DashboardHeaderControls } from "@/components/dashboard/dashboard-header-controls";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";
import { getGoogleQaSidebarNavVisible } from "@/lib/auth/business-context";
import { VerificationBanner } from "@/components/dashboard/verification-banner";
import { TrialBanner } from "@/components/dashboard/trial-banner";
import { PastDuePaymentBanner } from "@/components/dashboard/past-due-payment-banner";
import { ErrorBoundary } from "@/components/errors/error-boundary";
import { getGoogleConnectionStatus } from "@/lib/google/is-google-connected";
import { GoogleConnectBanner } from "@/components/dashboard/google-connect-banner";
import { getSettingsAccessContext } from "@/lib/auth/settings-access-context";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, activeContext, access: settingsAccess } = await getSettingsAccessContext();

  if (!user) {
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    redirect(rootDomain.includes("localhost") ? "/login" : `https://auth.${rootDomain}`);
  }

  const {
    businesses,
    allBusinesses,
    businessId: activeBusinessId,
    organization,
    organizations,
    business: activeBusiness,
  } = activeContext;

  const hideGoogleQaNav = !(await getGoogleQaSidebarNavVisible(activeBusinessId));

  const stripeCustomerId =
    typeof organization?.stripe_customer_id === "string" ? organization.stripe_customer_id : null;

  const headerContent = (
    <DashboardHeaderControls
      user={user}
      organization={organization}
      organizations={organizations}
      businesses={businesses}
      allBusinesses={allBusinesses}
      activeBusinessId={activeBusinessId}
    />
  );

  return (
    <SidebarProvider>
      <AppSidebar hideGoogleQaNav={hideGoogleQaNav} settingsAccess={settingsAccess} />
      <SidebarInset className="bg-canvas">
        <VerificationBanner user={user} />
        <TrialBanner organization={organization} />
        <PastDuePaymentBanner
          planStatus={organization?.plan_status}
          stripeCustomerId={stripeCustomerId}
          canManageBilling={settingsAccess.billing}
        />
        <GoogleConnectBanner
          status={activeBusiness?.id ? getGoogleConnectionStatus(activeBusiness.review_platforms) : "connected"}
          businessName={activeBusiness?.name}
        />
        <DashboardLayoutClient header={headerContent}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </DashboardLayoutClient>
      </SidebarInset>
      <MobileSidebarFAB />
    </SidebarProvider>
  );
}
