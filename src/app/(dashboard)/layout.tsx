import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { MobileSidebarFAB } from "@/components/dashboard/mobile-sidebar-fab";
import { UserNav } from "@/components/dashboard/user-nav";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { BusinessSwitcher } from "@/components/dashboard/business-switcher";
import { OrganizationDisplay } from "@/components/dashboard/organization-display";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";
import { getActiveBusinessId } from "@/lib/business-context";

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
    const { businesses, businessId: activeBusinessId, organization } = await getActiveBusinessId();

    const headerContent = (
        <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <OrganizationDisplay organization={organization} />
                <BusinessSwitcher
                    businesses={businesses}
                    activeBusinessId={activeBusinessId}
                />
            </div>
            <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserNav user={user} />
            </div>
        </div>
    );

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <DashboardLayoutClient header={headerContent}>
                    {children}
                </DashboardLayoutClient>
            </SidebarInset>
            <MobileSidebarFAB />
        </SidebarProvider>
    );
}
