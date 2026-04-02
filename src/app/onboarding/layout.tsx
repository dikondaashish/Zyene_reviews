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
        <div className="min-h-screen bg-[#f5f5f4] flex flex-col relative overflow-hidden">
            {/* Ambient gradient blobs */}
            <div className="pointer-events-none absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-orange-200/20 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-[-15%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-orange-200/15 blur-[100px]" />

            {/* Header with logo */}
            <header className="relative z-10 border-b border-orange-100/60 bg-white/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-2.5">
                        {/* Brand logo mark */}
                        <div className="w-9 h-9 bg-gradient-to-br from-[oklch(0.7_0.22_60)] to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 ring-1 ring-white/40">
                            <span className="text-white font-bold text-sm tracking-tight text-white">ZR</span>
                        </div>
                        <span className="text-lg font-bold text-[#262626] tracking-tight">
                            Zyene <span className="text-[oklch(0.7_0.22_60)]">Reviews</span>
                        </span>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="w-full max-w-6xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
