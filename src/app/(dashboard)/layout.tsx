import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { MobileSidebarFAB } from "@/components/dashboard/mobile-sidebar-fab";
import { UserNav } from "@/components/dashboard/user-nav";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { BusinessSwitcher } from "@/components/dashboard/business-switcher";
import { OrganizationDisplay } from "@/components/dashboard/organization-display";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { VerificationBanner } from "@/components/dashboard/verification-banner";
import { TrialBanner } from "@/components/dashboard/trial-banner";
import { ErrorBoundary } from "@/components/errors/error-boundary";

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
        if (rootDomain.includes("localhost")) {
            redirect("/login");
        } else {
            redirect(`https://auth.${rootDomain}`);
        }
    }

    // Get active business context (handles cookie + validation + fallback)
    const { businesses, businessId: activeBusinessId, organization, business: activeBusiness } =
        await getActiveBusinessId();

    const headerContent = (
        <div className="flex flex-1 items-center justify-between gap-3 min-w-0">
            <div className="flex min-w-0 flex-col gap-0.5">
                <div className="flex items-center gap-2 min-w-0">
                    <OrganizationDisplay organization={organization ? { 
                        id: organization.id, 
                        name: organization.name || "Your Organization" 
                    } : null} />
                    <BusinessSwitcher
                        businesses={businesses.map(b => ({
                            id: b.id,
                            name: b.name || "Business",
                            status: b.status || "active"
                        }))}
                        activeBusinessId={activeBusinessId}
                        maxBusinesses={organization?.max_businesses || 1}
                    />
                </div>
                {activeBusiness?.name ? (
                    <p
                        className="hidden text-[11px] text-muted-foreground truncate pl-0.5 md:block max-w-[min(42vw,380px)] lg:max-w-[480px]"
                        title={`Dashboard actions apply to ${activeBusiness.name}`}
                    >
                        <span className="text-muted-foreground/80">Scope: </span>
                        {activeBusiness.name}
                    </p>
                ) : businesses.length === 0 ? (
                    <p className="hidden text-[11px] text-primary md:block pl-0.5">
                        Add a business to use reviews, integrations, and team features.
                    </p>
                ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <ThemeToggle />
                <UserNav user={user} />
            </div>
        </div>
    );

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <VerificationBanner user={user} />
                <TrialBanner organization={organization} />
                <DashboardLayoutClient header={headerContent}>
                    <ErrorBoundary>{children}</ErrorBoundary>
                </DashboardLayoutClient>
            </SidebarInset>
            <MobileSidebarFAB />
        </SidebarProvider>
    );
}
