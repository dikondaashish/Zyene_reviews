import type { Metadata } from "next";
import { createClient } from "@/lib/db/supabase/server";
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
import { getActiveBusinessId, getGoogleQaSidebarNavVisible } from "@/lib/auth/business-context";
import { VerificationBanner } from "@/components/dashboard/verification-banner";
import { TrialBanner } from "@/components/dashboard/trial-banner";
import { PastDuePaymentBanner } from "@/components/dashboard/past-due-payment-banner";
import { ErrorBoundary } from "@/components/errors/error-boundary";
import { isOrganizationOwnerRole } from "@/lib/organization/organization-permissions";
import { getGoogleConnectionStatus } from "@/lib/google/is-google-connected";
import { GoogleConnectBanner } from "@/components/dashboard/google-connect-banner";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

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
    } = await getActiveBusinessId();

    const hideGoogleQaNav = !(await getGoogleQaSidebarNavVisible(activeBusinessId));
    const planStatusNorm = String(organization?.plan_status ?? "").toLowerCase().trim();
    let canManageBilling = false;
    if (planStatusNorm === "past_due" && organization?.id) {
        const { data: orgMember } = await supabase
            .from("organization_members")
            .select("role")
            .eq("user_id", user.id)
            .eq("organization_id", organization.id)
            .maybeSingle();
        canManageBilling = isOrganizationOwnerRole(orgMember?.role ?? "");
    }

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
            activeBusiness={activeBusiness}
        />
    );

    return (
        <SidebarProvider>
            <AppSidebar hideGoogleQaNav={hideGoogleQaNav} />
            <SidebarInset className="bg-canvas">
                <VerificationBanner user={user} />
                <TrialBanner organization={organization} />
                <PastDuePaymentBanner
                    planStatus={organization?.plan_status}
                    stripeCustomerId={stripeCustomerId}
                    canManageBilling={canManageBilling}
                />
                <GoogleConnectBanner
                    status={
                        activeBusiness?.id
                            ? getGoogleConnectionStatus(activeBusiness.review_platforms)
                            : "connected"
                    }
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
