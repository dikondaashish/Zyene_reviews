import type { Metadata } from "next";
import { createClient } from "@/lib/db/supabase/server";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex-metadata";

export const metadata: Metadata = {
    robots: NOINDEX_ROBOTS,
};

import { redirect } from "next/navigation";
import { ZyeneReviewsLogoMark } from "@/components/brand/zyene-reviews-logo-mark";
import { OnboardingHelpButton } from "@/components/onboarding/onboarding-help-button";
import { OnboardingAccountMenu } from "@/components/onboarding/onboarding-account-menu";

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
        <div data-app-onboarding className="flex min-h-dvh min-w-0 flex-col overflow-x-clip bg-canvas">
            <header className="border-b border-border/70 bg-card">
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
                    <ZyeneReviewsLogoMark size={28} priority />
                    <span className="text-base font-semibold tracking-tight text-foreground">
                        Zyene <span className="text-primary">Reviews</span>
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                        <OnboardingHelpButton />
                        <OnboardingAccountMenu email={user.email ?? ""} />
                    </div>
                </div>
            </header>

            {/* Content sits near the top, so the progress bar stays put while steps change height. */}
            <main className="flex min-w-0 flex-1 justify-center px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-8">
                <div className="w-full min-w-0 max-w-6xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
