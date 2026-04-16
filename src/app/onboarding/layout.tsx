import { createClient } from "@/lib/db/supabase/server";
import Image from "next/image";
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
        <div className="relative flex min-h-screen min-w-0 flex-col overflow-x-clip bg-[#f5f5f4]">
            {/* Ambient gradient blobs */}
            <div className="pointer-events-none absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-[-15%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/15 blur-[100px]" />

            {/* Header with logo */}
            <header className="relative z-10 border-b border-primary/20 bg-background/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow-lg shadow-primary/20 ring-1 ring-background/40">
                            <Image
                                src="/Main%20logo.png"
                                alt="Zyene Reviews"
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                                priority
                            />
                        </div>
                        <span className="text-lg font-bold text-[#262626] tracking-tight">
                            Zyene <span className="text-[oklch(0.7_0.22_60)]">Reviews</span>
                        </span>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="relative z-10 flex min-w-0 flex-1 items-center justify-center px-4 py-8 sm:px-6 md:py-12 lg:px-8">
                <div className="w-full min-w-0 max-w-6xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
