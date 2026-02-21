import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { UserNav } from "@/components/dashboard/user-nav";
import { BusinessSwitcher } from "@/components/dashboard/business-switcher";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

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

    // Fetch organizations with nested businesses and review platforms
    const { data: members } = await supabase
        .from("organization_members")
        .select(`
            organizations (
                *,
                businesses (
                    *,
                    review_platforms (*)
                )
            )
        `)
        .eq("user_id", user.id);

    const organizations = members?.map((m) => m.organizations).filter(Boolean) || [];

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BusinessSwitcher organizations={organizations} />
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
