import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { UserNav } from "@/components/dashboard/user-nav";
import { BusinessSwitcher } from "@/components/dashboard/business-switcher";
import { OrganizationDisplay } from "@/components/dashboard/organization-display";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
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
            redirect(`http://auth.${rootDomain}`);
        }
    }

    // Get active business context (handles cookie + validation + fallback)
    const { businesses, businessId: activeBusinessId, organization } = await getActiveBusinessId();

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <OrganizationDisplay organization={organization} />
                            <BusinessSwitcher
                                businesses={businesses}
                                activeBusinessId={activeBusinessId}
                            />
                        </div>
                        <UserNav user={user} />
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
