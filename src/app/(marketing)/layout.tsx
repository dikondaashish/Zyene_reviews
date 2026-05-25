"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { UtmCapture } from "@/components/marketing/utm-capture";
import { AdLandingBanner } from "@/components/marketing/ad-landing-banner";
import { MarketingLayoutAnnouncementBar } from "./marketing-layout-announcement-bar";
import { MarketingLayoutHeader } from "./marketing-layout-header";
import { MarketingLayoutFooter } from "./marketing-layout-footer";

function isGrowthOperationsPath(pathname: string | null): boolean {
    return pathname === "/growth" || (pathname?.startsWith("/growth/") ?? false);
}

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const growthDashboard = isGrowthOperationsPath(pathname);

    return (
        <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background text-foreground">
            {growthDashboard ? null : <MarketingLayoutAnnouncementBar />}
            <MarketingLayoutHeader />
            <Suspense fallback={null}>
                <UtmCapture />
            </Suspense>
            {growthDashboard ? null : (
                <Suspense fallback={null}>
                    <AdLandingBanner />
                </Suspense>
            )}
            <main className="min-w-0 flex-1">{children}</main>
            {growthDashboard ? null : <CookieBanner />}
            {growthDashboard ? null : <MarketingLayoutFooter />}
        </div>
    );
}
