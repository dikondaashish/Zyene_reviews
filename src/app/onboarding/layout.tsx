import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({
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
        redirect(`https://auth.${rootDomain}`);
    }

    // First-time users only: completed users should not access onboarding.
    const { data: profile } = await supabase
        .from("users")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

    if (profile?.onboarding_completed) {
        redirect("/dashboard");
    }

    return (
        <div className="relative min-h-screen overflow-x-clip bg-background">
            <header className="relative z-10 border-b border-border/80 bg-card">
                <div className="mx-auto flex max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                            <span className="text-sm font-bold tracking-tight text-white">ZR</span>
                        </div>
                        <span className="text-lg font-semibold tracking-tight text-foreground">
                            Zyene Reviews
                        </span>
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto grid min-h-[calc(100vh-73px)] w-full max-w-7xl items-stretch px-4 py-6 sm:px-6 lg:grid-cols-2 lg:gap-0 lg:px-8 lg:py-0">
                <section className="flex min-w-0 items-center py-4 lg:py-12">
                    <div className="w-full min-w-0">{children}</div>
                </section>
                <aside className="hidden border-l border-border/80 bg-[#d8e8e6] lg:flex lg:items-center lg:justify-center">
                    <div className="w-full max-w-md space-y-4 px-8">
                        <div className="ml-auto h-28 w-28 rounded-xl border border-border/70 bg-card" />
                        <div className="rounded-xl border border-border/70 bg-card p-6">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="h-14 rounded-lg bg-[#d8e8e6]" />
                                <div className="h-14 rounded-lg bg-[#d8e8e6]" />
                                <div className="h-14 rounded-lg bg-[#d8e8e6]" />
                            </div>
                        </div>
                        <div className="rounded-xl border border-border/70 bg-card p-6">
                            <div className="grid grid-cols-4 gap-3">
                                <div className="h-14 rounded-lg bg-[#d8e8e6]" />
                                <div className="h-14 rounded-lg bg-[#d8e8e6]" />
                                <div className="h-14 rounded-lg bg-[#d8e8e6]" />
                                <div className="h-14 rounded-lg bg-[#d8e8e6]" />
                            </div>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}
